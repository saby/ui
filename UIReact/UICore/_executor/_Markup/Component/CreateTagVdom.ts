import * as React from 'react';
import { wasabyAttrsToReactDom, IWasabyAttributes } from '../Attributes';
import { TWasabyEvent, SyntheticEvent } from 'UICommon/Events';
import { AttrToDecorate } from '../interfaces';
import { ArrayUtils, Logger } from 'UICommon/Utils';
import { Attr, IGeneratorComponent } from 'UICommon/Executor';
import { FocusRoot, IFocusAreaProps } from 'UICore/Focus';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { CreateNotifyRef } from '../Refs/CreateNotifyRef';
import { CreateInvisibleNodeRef } from '../Refs/CreateInvisibleNodeRef';
import { CreateClearElementRef } from '../Refs/CreateClearElementRef';
import { CreateWheelEventRef } from '../Refs/CreateWheelEventRef';
import { _FocusAttrs } from 'UICommon/Focus';
import { wasabyEventIntersection } from 'UICore/Events';
import type { Control } from 'UICore/Base';
import { mergeAttrs } from '../../_Utils/Attr';
import { EventUtils } from 'UICommon/Events';
import { calcOriginEventName } from '../Generator';

const isServerSide = typeof window === 'undefined';

export class CreateTagVdom implements IGeneratorComponent {
    // В react поля ввода должны быть или контролируемыми (используется checked и onChange)
    // или иметь значение по-умолчанию defaultChecked
    // второй вариант нам не подходит, т.к. придется переписать все местах использования input с checked
    // поэтому для input, которые создаем сами будет добавлять пустой onChange,
    // чтобы изменение наших реактивных свойств вызывало перерисовку input
    private patchInputTag(tagName: string, attrs: Record<string, unknown>): void {
        if (tagName === 'input') {
            attrs.onChange = () => {
                return;
            };
            attrs.checked = !!attrs.checked;
        }
    }
    create<T extends HTMLElement, P extends React.HTMLAttributes<T>>(
        tagName: keyof React.ReactHTML | 'invisible-node',
        attrs: {
            attributes: P & IWasabyAttributes;
            events: TWasabyEvent;
        },
        children: React.ReactNode[],
        attrToDecorate: AttrToDecorate,
        __: unknown,
        control?: Control,
        isContainerNode?: boolean
    ): React.DetailedReactHTMLElement<P, T> {
        if (!attrToDecorate) {
            attrToDecorate = { attributes: {}, events: {}, reactEvent: {} };
        }

        let fullEvents = {};
        if (!isServerSide) {
            /* если события объявляется на контроле, и корневом элементе шаблона, то мы должны смержить события,
             * без этого события объявленные на контроле будут потеряны
             */
            fullEvents =
                calcOriginEventName(Attr.mergeEvents(attrToDecorate.events, attrs.events)) || {};
        }

        // Объединяет атрибуты, указанные на элементе, с атрибутами, которые пришли сверху
        // Здесь wasabyAttrsToReactDom вызвается со вторым аргументом false, т.к. иначе значения boolean
        // атрибутов превратятся в строки и сломается логика объединения атрибутов в методе mergeAttrs
        const mergedAttrs = mergeAttrs(
            wasabyAttrsToReactDom(attrToDecorate.attributes, false),
            wasabyAttrsToReactDom(attrs.attributes, false)
        );
        for (const attrName of Object.keys(mergedAttrs)) {
            if (mergedAttrs[attrName] === undefined) {
                delete mergedAttrs[attrName];
            }
        }
        mergedAttrs.key = mergedAttrs.key || attrs.key;
        this.patchInputTag(tagName, mergedAttrs);

        const name = mergedAttrs.name;
        let chainOfRef: ChainOfRef;
        if (!isServerSide) {
            chainOfRef = new ChainOfRef();
            if (!!control?.childrenRefsCreator) {
                chainOfRef.add(control.childrenRefsCreator.createRef(name));
            }

            const { wasabyEvent, nativeEvent } = this.delimitEvent(fullEvents);

            prepareEvents(nativeEvent);
            this.createReactCallbacks(mergedAttrs, nativeEvent, chainOfRef);
            const createNotifyRef = new CreateNotifyRef(wasabyEvent, control);
            const createClearElementRef = new CreateClearElementRef();
            chainOfRef.add(createNotifyRef);
            chainOfRef.add(createClearElementRef);

            // attributes может не быть, из декоратора маркапа передается только объект с ключом например...
            const originRef = attrs.attributes?.ref;
            if (originRef) {
                chainOfRef.add(new CreateOriginRef(originRef));
            }

            if (
                isContainerNode ||
                attrToDecorate._isRootElement ||
                attrToDecorate.isContainerNodeInline
            ) {
                // реф от контрола, чтобы навесить controlNodes, $controls, _container
                if (attrToDecorate.refForContainer) {
                    chainOfRef.add(new CreateOriginRef(attrToDecorate.refForContainer));
                }
            }
        }

        // важно вызывать этот реф в конце, чтобы controlNodes и _$controls были высчитаны
        if (tagName === 'invisible-node') {
            if (!isServerSide) {
                chainOfRef.add(new CreateInvisibleNodeRef(control, isContainerNode));
            }
            // очищаем invisible-node от всего лишнего, это необходимо чтобы invisible-node не ломали верстку
            delete mergedAttrs.className;
            mergedAttrs.tabindex = '-1';
            mergedAttrs.class = 'ws-hidden';
        }

        if (!isServerSide) {
            /* не добавляем extractedEvents в новые пропсы на теге,
                т.к. реакт будет выводить ошибку о неизвестном свойстве
                https://online.sbis.ru/opendoc.html?guid=d90ec578-f610-4d93-acdd-656095591bc1
            */
            mergedAttrs.ref = chainOfRef.execute();
        }

        let finalTagName: React.ElementType | 'invisible-node' = tagName;
        if (_FocusAttrs.hasFocusRootAttributes(mergedAttrs)) {
            const focusAreaProps: IFocusAreaProps =
                _FocusAttrs.extractAttributesForFocusArea(mergedAttrs);
            mergedAttrs.as = tagName;
            finalTagName = FocusRoot;

            mergedAttrs.tabIndex = focusAreaProps.tabIndex;
            mergedAttrs.unclickable = focusAreaProps.unclickable;
            mergedAttrs.autofocus = focusAreaProps.autofocus;
            mergedAttrs.cycling = focusAreaProps.cycling;
        }

        // Разворачиваем массив с детьми, так как в противном случае react считает, что мы отрисовываем список
        const flatChildren = ArrayUtils.flatten(children, true, true);
        if (flatChildren.for) {
            // если дети получены циклом - нужно вставлять их массивом, чтобы учитывались ключи
            return React.createElement<P, T>(finalTagName, mergedAttrs, flatChildren);
        }
        return React.createElement<P, T>(finalTagName, mergedAttrs, ...flatChildren);
    }

    private delimitEvent(eventData) {
        const events = Object.keys(eventData);
        const nativeEvent = {};
        const wasabyEvent = {};
        for (const key of events) {
            if (!wasabyEventIntersection[key]) {
                wasabyEvent[key] = eventData[key];
            } else {
                nativeEvent[key] = eventData[key];
            }
        }
        if (Object.keys(wasabyEvent).length) {
            Object.defineProperty(wasabyEvent, 'meta', {
                configurable: true,
                value: eventData.meta,
            });
        }
        if (Object.keys(nativeEvent).length) {
            Object.defineProperty(nativeEvent, 'meta', {
                configurable: true,
                value: eventData.meta,
            });
        }
        return { wasabyEvent, nativeEvent };
    }

    /**
     * Метод создает колбэк нативного события, добавляет его в props тэга
     * @param props
     * @param eventData
     * @param chainOfRef
     * @returns {void}
     */
    private createReactCallbacks<P>(
        props: P,
        eventData: Record<string, TWasabyEvent[]>,
        chainOfRef: ChainOfRef
    ): void {
        const events = Object.keys(eventData);
        for (const key of events) {
            const nativeEventName = wasabyEventIntersection[key];
            if (!nativeEventName) {
                return;
            }
            const eData = eventData[key];
            const eventCallback = (event, ...args) => {
                for (const item of eData) {
                    if (item instanceof Function) {
                        item(event);
                        return;
                    }

                    try {
                        const eventArgs = this.prepareEventArgs(event, item.args, args);
                        if (item.value === '__$nativeEvent') {
                            item.handler(...eventArgs);
                            continue;
                        }
                        const thisContext = () => {
                            return item.viewController;
                        };
                        const preparedContext = item.context || thisContext;
                        const eventContext = preparedContext.apply(item.viewController);
                        if (item.handler) {
                            const handler = item.handler.apply(item.viewController);
                            handler.apply(eventContext, eventArgs);
                        } else {
                            const wrappedHandler = () => {
                                return item.fn.apply(item.fn.control, eventArgs);
                            };
                            // тут проблема в slate editor, который меняет свой стейт во время другой перерисовки
                            if (!item.fn) {
                                continue;
                            }
                            if (!item.fn.control._mounted) {
                                item.fn.control._$afterMountDecorator.saveDelayedEvent(
                                    wrappedHandler
                                );
                                continue;
                            }
                            wrappedHandler();
                        }
                        if (eventArgs && eventArgs[0]?.isStopped?.()) {
                            event.stopPropagation();
                            break;
                        }
                    } catch (e) {
                        Logger.error('Ошибка при вызове события', undefined, e);
                    }
                }
            };

            // событие whell в реакте пассивное и у него нельзя вызывать preventDefault
            // а у нас есть логика которая требует такого поведения (например, календарь)
            if (nativeEventName === 'onWheel') {
                chainOfRef.add(new CreateWheelEventRef(eventCallback));
                continue;
            }
            props[nativeEventName] = eventCallback;
        }
    }

    private prepareEventArgs(event, itemArgs, args) {
        let _event = event;
        // если wasabySyntheticEvent - undefined значит в реакте вызывали обработчики без аргументов
        // например props.onClick()
        // если нет target, значит первым аргументом в колбэк передали не объект события,
        // в таком случае следует вызывать обработчик с аргументами из реакта
        if (!!_event?.target && !(_event instanceof SyntheticEvent)) {
            _event = this.calculateEventObject(_event);
        }

        return [_event, ...this.calculateArgs(itemArgs, args)];
    }

    private calculateEventObject(event) {
        let sEvent;
        if (!event.nativeEvent || (event.nativeEvent && event.nativeEvent.type !== event.type)) {
            sEvent = new SyntheticEvent(event);
        } else {
            sEvent = new SyntheticEvent(event.nativeEvent);
        }
        if (event.type === 'mouseenter' || event.type === 'mouseout') {
            sEvent.target = event.currentTarget;
        }
        sEvent.currentTarget = event.currentTarget;
        return sEvent;
    }

    private calculateArgs(itemArgs, args) {
        return args?.length ? args : itemArgs?.length ? itemArgs : [];
    }
}

function prepareEvents(events /* TTemplateEventObject*/) {
    for (const eventName of Object.keys(events)) {
        const eventArr = events[eventName];
        for (const event of eventArr) {
            // КОСТЫЛЬ для Markup/Decorator
            // обсуждение тут https://online.sbis.ru/opendoc.html?guid=0ded1bc8-6886-4669-a6f8-816537207099
            // если задан isControlEvent = false значит событие уже настроено,
            // например Markup/Decorator создал такое событие
            // @ts-ignore
            if (event.fn?.isControlEvent === false) {
                continue;
            }

            if (isBindValue(event)) {
                prepareBind(event);
                continue;
            }
            if (isNativeCallback(event)) {
                prepareNativeReact(event);
                continue;
            }
            prepareWasabyEvent(event, events.meta.context, events.meta.handler);
        }
    }
    return events;
}

const REACT_FAKE_CONTROL = {
    _destroyed: false,
    _mounted: true,
    _moduleName: 'native React component',
    UNSAFE_isReact: true,
};

function isNativeCallback(event) {
    return event instanceof Function;
}

function isBindValue(event) {
    return 'bindValue' in event;
}

function bindEvent(event): void {
    event.fn = event.fn.bind({
        viewController: event.viewController,
        data: event.data,
    });
    event.fn.control = event.viewController;
}

function prepareBind(
    event // ITemplateBindEvent,
) {
    const ev = function (_, value: string): void {
        EventUtils.checkBindValue(event, event.bindValue);
        if (this.viewController === REACT_FAKE_CONTROL) {
            event.handler(this.data, value);
            return;
        }
        if (!event.handler(this.viewController, value)) {
            event.handler(this.data, value);
        }
    };
    event.fn = ev;
    bindEvent(event);
    return event;
}

function prepareNativeReact(event: Function): void {
    // nothing
}

function prepareWasabyEvent(
    event, // ITemplateEventBase,
    metaContex: Function,
    metaHandler // TEventHandler
): TWasabyEvent {
    const ev = function (eventObj: SyntheticEvent): void {
        const args = arguments;
        const preparedContext = event.context || metaContex;
        const eventContext = preparedContext.apply(this.viewController);
        const handler = event.handler
            ? event.handler.apply(this.viewController)
            : metaHandler.apply(this.viewController, [event.value]);
        if (typeof handler === 'undefined') {
            throw new Error(
                `Отсутствует обработчик ${event.value} события ${eventObj.type}` +
                    ` у контрола ${event.viewController._moduleName}`
            );
        }
        const res = handler.apply(eventContext, args);
        if (res !== undefined) {
            eventObj.result = res;
        }
    };
    event.fn = ev;
    bindEvent(event);
    return event as TWasabyEvent;
}
