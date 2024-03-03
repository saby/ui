/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { logger } from 'Application/Env';
import type { IGeneratorAttrs } from '../interfaces';
import type { Control } from 'UICore/Base';
import type { IControlOptions } from 'UICommon/Base';
import {
    reactEventList,
    wasabyEventIntersection,
    isCustomEvent,
    getOldReactEventName,
} from 'UICore/Events';
import { IFocusAreaProps, FocusArea } from 'UICore/Focus';
import { SyntheticEvent } from 'UICommon/Events';
import { WasabyContextManager, wasabyContextPropNames } from 'UICore/Contexts';
import { mergeAttrs } from '../../_Utils/Attr';
import ContentAsChildren from './ContentAsChildren';
import {
    reactAttrNames,
    additionalReactAttrNames,
    ATTR_DATA_REG_EXP,
    ATTR_STYLE,
} from '../wasabyToReactAttrNames';
import { isFunctionComponent, isReactComponentType } from './ReactTypesChecker';
import FocusAreaBeforeReactComponent from './FocusAreaBeforeReactComponent';
import { Logger } from 'UICommon/Utils';
import { constants } from 'Env/Env';

const WML_ONLY_GENERATED_KEYS = ['_$internal', '_$events', '_$blockOptionNames', '_$attributes'];

const rkFlag = 'i18n';
const isWasabyTemplateFlag = 'isWasabyTemplate';
const isDataArrayFlag = 'isDataArray';

// В опцию content через скоуп может попасть объект с опциями контента.
// Проверим, что пришло в content, прежде чем делать из него children.
function isValidContent(content: unknown): boolean {
    const contentType = typeof content;
    if (contentType === 'undefined' || (contentType === 'object' && !content)) {
        return false;
    }
    return (
        contentType === 'function' ||
        contentType === 'string' ||
        content[rkFlag] ||
        content[isWasabyTemplateFlag] ||
        content[isDataArrayFlag] ||
        Array.isArray(content) ||
        isReactComponentType(content)
    );
}

type TRefType = (node?: any) => void;
export type TJsxProps<P = unknown> = P & {
    name?: string;
    className?: string;
    $wasabyRef?: any | TRefType;
    forwardedRef?: any | TRefType;
    attrs?: Record<string, any>;
    context?: Record<string, unknown>;
    ref?: React.Ref<any>;
    children?: React.ReactNode;
    onAfterMount?: () => void;
    onAfterUpdate?: () => void;
};

// region вынести в модуль и использовать в CreateTagVdom
import { _FocusAttrs } from 'UICommon/Focus';
import { TWasabyEvent, TEventObject } from 'UICore/Events';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { CreateNotifyRef } from 'UICore/_executor/_Markup/Refs/CreateNotifyRef';

export interface ITemplateAttrs extends IGeneratorAttrs {
    refForContainer: TRefType;
    /**
     * Признак вызова функции генератора из tsx
     */
    isReactWrapper?: true;
}

interface IStyledProps {
    style?: React.CSSProperties;
}

/**
 * Класс для создания $wasabyRef для чистого ReactComponent | ReactFunctionalComponent.
 * Он дублирует логику, которая должна вызвается в wml при создании ref который вешается на DOMElement.
 * @private
 */
export class WasabyDOMRefGeneration {
    /**
     * @param refForContainer   ref, сформированный для выставления _container Wasaby-контрола.
     * @param forwardedRef  это может быть как перенаправленный ref, напр. refForContainer от какого-то Wasaby-родителя,
            так и ref созданный в createControlNew -> calculateOptions, как childrenRef.
            Поэтому при формировании нового forwardedRef этот ref нужно примешать в цепочку с refForContainer.
     */
    constructor(private refForContainer: TRefType, private forwardedRef: TRefType) {}

    generate(events: TEventObject, props: any) {
        const chainOfRef = new ChainOfRef();
        const customEvents = {};
        for (const name of Object.keys(events)) {
            if (Object.keys(wasabyEventIntersection).indexOf(name) === -1) {
                customEvents[name] = events[name];
            }
        }
        Object.defineProperty(customEvents, 'meta', {
            configurable: true,
            value: events.meta || {},
        });
        const createNotifyRef = new CreateNotifyRef(customEvents, props._logicParent);
        // пока удалим customEvents из props, чтобы в случае вложения хоков wasaby-react
        // не создавать несколько notifyRef с одной и той же подпиской
        if (props.customEvents) {
            delete props.customEvents;
        }

        // В классовом компоненте мы удаляем props.name перед вызовом создания рефа.
        // Следовательно, специальный children-активатор мы создадим только для функционального компонента,
        // на который в wml повесили name.
        if (props.name && props._logicParent?.childrenRefsCreator) {
            chainOfRef.add(props._logicParent?.childrenRefsCreator.createRef(props.name, true));
        }

        chainOfRef.add(createNotifyRef);
        if (this.refForContainer) {
            chainOfRef.add(new CreateOriginRef(this.refForContainer));
        }
        if (this.forwardedRef) {
            chainOfRef.add(new CreateOriginRef(this.forwardedRef));
        }
        return chainOfRef.execute();
    }
}
// endregion

/**
 * Класс создания ReactElement внутри logicless(wml) окружении
 * @private
 */
export default class ReactElementIntoTemplate {
    /**
     * Является ли элемент реактовским компонентом
     * @param component сущность переданная в partial
     */
    isRelevant(component: unknown): component is React.ComponentType {
        return isReactComponentType(component);
    }

    /**
     * Создание ReactElement из React.ComponentClass в wml окружении
     * @param logicParent
     * @param physicParent не используется. Нацелен на интерфейс
     * @param component React.ComponentClass
     * @param props
     * @param templateAttrs
     * @returns {React.ReactElement} react-контрол
     */
    private create<P = {}>(
        component:
            | React.ComponentClass<P & IControlOptions>
            | React.FunctionComponent<P & IControlOptions>,
        props: P & IControlOptions & TJsxProps,
        isVdom: boolean
    ): React.ReactElement {
        this.prepareChildren(props);
        const reactElementForComponent = React.createElement(component, props);

        const focusAreaProps: IFocusAreaProps & {
            noErrorUnusedFocusProps?: boolean;
        } = _FocusAttrs.extractAttributesForFocusArea(props.attrs);

        const focusAreaCallbacks = FocusAreaBeforeReactComponent.takeFocusCallbacks();
        if (focusAreaCallbacks) {
            focusAreaProps.onActivated = focusAreaCallbacks.onActivated;
            focusAreaProps.onDeactivated = focusAreaCallbacks.onDeactivated;
        }

        focusAreaProps.children = reactElementForComponent;
        focusAreaProps.noErrorUnusedFocusProps = true;
        const children = React.createElement(FocusArea, focusAreaProps);

        // Необходимо обернуть чистый реакт, вставленный в wml, в WasabyContextManager.
        // 1. в чистом реакте не придётся смотреть prop.theme, актуальная тема всегда будет в контексте.
        // 2. Если тема изменится на уровне конкретного реакт компонента, её прокидывание ниже не потеряется.
        // Тема только для примера, это касается всех опций из WasabyContextManager.
        const reactElement = React.createElement(
            WasabyContextManager,
            {
                key: props.key + 'c_',
                readOnly: props.readOnly,
                theme: props.theme,
                _physicParent: props._physicParent,
                _logicParent: props._logicParent,
                _parentKey: props.rskey,
                pageData: props.pageData,
                Router: props.Router,
                isAdaptive: props.isAdaptive,
                workByKeyboard: props.workByKeyboard,
                moduleName: component.displayName || component.name || 'unknown',
            },
            children
        );
        if (!isVdom) {
            // @ts-ignore
            return renderToString(reactElement);
        }
        return reactElement;
    }

    private createWasabyRef(
        templateAttrs: ITemplateAttrs,
        props: any,
        forwardedRef: TRefType
    ): TRefType {
        if (!!templateAttrs.isReactWrapper && forwardedRef) {
            return forwardedRef;
        }

        // см. описание WasabyDOMRefGeneration
        return (
            new WasabyDOMRefGeneration(templateAttrs.refForContainer, forwardedRef)
                // @ts-ignore
                .generate(templateAttrs.events, props)
        );
    }

    private prepareChildren(props: IControlOptions & TJsxProps): void {
        ReactElementIntoTemplate.convertStringChildren(props);

        // Может быть ситуация, когда children прокинули через скоуп.
        // Так что если children уже есть и является ContentAsChildren - перепишем для текущего контента.
        const content = props.content;
        if (
            isValidContent(content) &&
            (!props.children ||
                (React.isValidElement(props.children) && props.children.type === ContentAsChildren))
        ) {
            props.children = React.createElement(ContentAsChildren, {
                content,
            });
        }
    }

    createFnComponent<P = {}>(
        component:
            | React.FunctionComponent<P & IControlOptions>
            | React.ForwardRefExoticComponent<P & IControlOptions>,
        props: P & IControlOptions & TJsxProps,
        templateAttrs: ITemplateAttrs,
        isVdom: boolean
    ): React.ReactElement {
        if (props.onAfterUpdate) {
            Promise.resolve().then(props.onAfterUpdate);
        }
        const finalProps = ReactElementIntoTemplate.createProps<P & IControlOptions & TJsxProps>(
            props,
            templateAttrs
        );

        // здесь finalProps.ref может быть как перенаправленный ref,
        // так и ref созданный в createControlNew -> calculateOptions, как childrenRef
        // поэтому при формировании нового forwardedRef этот finalProps.ref нужно примешать в цепочку с refForContainer
        finalProps.$wasabyRef = finalProps.ref = this.createWasabyRef(
            templateAttrs,
            finalProps,
            finalProps.ref || finalProps.$wasabyRef
        );

        if (isFunctionComponent(component)) {
            // На данный момент попытка повесить реф на функциональный компонент только спамит ошибки в консоль.
            delete finalProps.ref;
        }

        return this.create(component, finalProps, isVdom);
    }

    createComponent<P = {}>(
        component: React.ComponentClass<P & IControlOptions>,
        props: P & IControlOptions & TJsxProps,
        templateAttrs: ITemplateAttrs,
        isVdom: boolean
    ): React.ReactElement {
        if (props.onAfterUpdate) {
            const originRef = props.ref;
            props.ref = (node: Control) => {
                // @ts-ignore
                originRef?.(node);
                if (!node) {
                    return;
                }
                props?.onAfterUpdate?.();
            };
        }
        const finalProps = ReactElementIntoTemplate.createProps<P & IControlOptions & TJsxProps>(
            props,
            templateAttrs
        );

        // Удаляем name. childrenRef должен остаться на классовом компоненте, не нужно прокидывать дальше.
        delete finalProps.name;

        // здесь props.forwardedRef это перенаправленный ref,
        // поэтому при формировании нового forwardedRef его нужно примешать в цепочку с refForContainer
        finalProps.$wasabyRef = finalProps.forwardedRef = this.createWasabyRef(
            templateAttrs,
            finalProps,
            props.forwardedRef || props.$wasabyRef
        );
        return this.create(component, finalProps, isVdom);
    }

    createContextProvider<T = unknown>(
        component: React.Provider<T>,
        props: IControlOptions & TJsxProps & { value?: T },
        isVdom: boolean
    ): React.ReactElement {
        this.prepareChildren(props);
        const value = props.value;
        const element = React.createElement(component, { value }, props.children);

        if (!isVdom) {
            // @ts-ignore
            return renderToString(element);
        }
        return element;
    }

    private static createProps<P>(templateScope: P, templateAttrs: ITemplateAttrs): P {
        let props: P & IControlOptions & TJsxProps =
            ReactElementIntoTemplate.copyFromPrototype(templateScope);

        // удаляем этот prop для чистых react компонентов
        delete props._$key;

        /* Нужно добавить key,
           потому что в шаблонных функциях все дети всегда передаются в массиве,
           а значит для реакта это дети в цикле */
        // @ts-ignore
        if (!props.key) {
            // @ts-ignore
            props.key = templateAttrs.key;
        }
        for (const key of WML_ONLY_GENERATED_KEYS) {
            delete props[key];
        }
        // на случай если задали проп attrs надо не потерять его содержимое
        props.attrs = mergeAttrs(templateAttrs.attributes, props.attrs);

        // скопируем атрибуты в props
        props = ReactElementIntoTemplate.copyAtributesToProps<P & TJsxProps>(props);

        ReactElementIntoTemplate.executeFocusEvents(templateAttrs.events);

        return ReactElementIntoTemplate.prepareEvents<P & TJsxProps>(
            props as P & TJsxProps,
            templateAttrs.events
        );
    }

    /**
     * Перекидываем все свойства, включая прототипные на объект
     */
    private static copyFromPrototype<T>(obj: T): T {
        const props: Partial<T> = {};
        // eslint-disable-next-line guard-for-in
        for (const key in obj) {
            props[key] = obj[key];
        }
        return props as T;
    }

    /**
     * Копируем атрибуты из props.attrs в props
     */
    protected static copyAtributesToProps<P>(
        props: P & TJsxProps<IStyledProps>
    ): P & TJsxProps<IStyledProps> {
        if (!props.attrs) {
            return props;
        }
        const attrs = Object.keys(props.attrs);
        if (attrs.length === 0) {
            return props;
        }
        for (const attrName of attrs) {
            if (wasabyContextPropNames.has(attrName)) {
                // Пропсы, которые кладутся в контекст, нельзя брать из атрибутов.
                continue;
            }
            if (attrName === ATTR_STYLE) {
                // В API контролов есть строковая опция style. В идеале им переименовать опцию, но пока лучше так.
                if (typeof props[attrName] !== 'string') {
                    props[attrName] = props.attrs[attrName];
                }
                continue;
            }
            if (
                reactAttrNames.has(attrName) ||
                additionalReactAttrNames.has(attrName) ||
                ATTR_DATA_REG_EXP.test(attrName)
            ) {
                props[attrName] = props.attrs[attrName];
            }
        }
        return props;
    }

    private static isNativeFunction(handler): handler is TEventObject {
        return handler instanceof Function;
    }

    // отделяем события on:activated/on:deactivated от остальных для передачи в FocusArea.
    private static executeFocusEvents(events: Record<string, TWasabyEvent[]>): void {
        const focusEvents = FocusAreaBeforeReactComponent.executeFocusEventsObject(events);
        if (!focusEvents) {
            return;
        }
        const focusAreaEvents: Record<string, Function> = {};
        ReactElementIntoTemplate.prepareEvents(focusAreaEvents, focusEvents);
        FocusAreaBeforeReactComponent.saveFocusEventsAsFocusCallbacks(focusAreaEvents);
    }

    /**
     * Проверка аргументов переданных в обработчик customEvents
     * попадаем сюда, когда вызвается props.onEvent(e, arg1),
     * и первым аргументом передали синтетическое событие react
     * эта проверка нужна только для упрощения дебага
     */
    private static wrongCustomEventArguments(eventName: string, control: Control): void {
        // отключаем проверку в релизе
        if (constants.isProduction) {
            return;
        }
        // проверять надо только пользовательские события,
        // для нативных событий синтетическое событие react первым аргументом является правильным поведением
        if (this.isNativeEvent(eventName)) {
            return;
        }
        Logger.warn(
            `Обнаружен вызов wasaby-события как колбэк-функции.
            Вызывается "${eventName}".
            Родительский контрол: ${control._moduleName}
            Проверьте правильность переданных аргументов.
            Первым аргументом должен быть объект события`,
            control
        );
    }

    private static isNativeEvent(eventName: string): boolean {
        return reactEventList.indexOf(eventName) > -1;
    }

    /**
     * Подготавливаем именя событий из on:click к onClick в props, когда в контентной опции React.Element
     * TODO перенести в генератор, что бы можно было в нативных элементах
     *  из Executor.createElement передавать события в props
     */
    private static prepareEvents<P>(props: P, eventData: Record<string, TWasabyEvent[]>): P {
        const events = Object.keys(eventData);
        for (const key of events) {
            const _event = key.split(':');
            // метаданные событий нам не нужны
            if (_event[0] === 'meta') {
                continue;
            }
            let reactEventName;
            if (Object.keys(wasabyEventIntersection).indexOf(key) === -1) {
                reactEventName = 'on' + _event[1].charAt(0).toUpperCase() + _event[1].slice(1);
            } else {
                reactEventName = wasabyEventIntersection['on:' + _event[1]];
            }

            const eventCallbackFn = (event, ...args) => {
                const isWasabyEventArgs = event instanceof SyntheticEvent;
                let result;
                for (const item of eData) {
                    if (typeof item === 'undefined') {
                        Logger.error(
                            `Попытка вызова события "${reactEventName}" у которого отсутствует обработчик. Событие вызвано не будет.
                             Для исправления ошибки необходимо найти место, где создается это событие и понять причину отсутствия обработчика.
                             Скорее всего проблема в том, что обработчик берется безусловно из необязательной опции.`,
                            props._logicParent
                        );
                        continue;
                    }
                    if (ReactElementIntoTemplate.isNativeFunction(item)) {
                        props[reactEventName] = eData;
                        const finalArgs = item.saveWasabyEventObject ? [event, ...args] : [event];
                        // @ts-ignore сюда передали руками нативное событие
                        item(...finalArgs); // ...arguments
                        continue;
                    }
                    if (item?.hasOwnProperty('bindValue')) {
                        // args всегда массив, а бинд работает с примитивами
                        // если event синтетическое событие васаби, то значение бинда берется "по-старому"
                        // из реакта могут передать event, который может быть как нативый, так и ReactEvent
                        // если event undefined, значит его так и передали в аргумент колбэка
                        let newValue =
                            isWasabyEventArgs ||
                            (event && event.target && event.type) ||
                            typeof event === 'undefined'
                                ? args[0]
                                : event;
                        if (isCustomEvent(event)) {
                            newValue = event.detail[1];
                        }
                        // bind внутри контентной опции могу написать на саму опцию, а не на контрол
                        if (!item.handler(item.viewController, newValue)) {
                            item.handler(item.data, newValue);
                        }
                        continue;
                    }
                    try {
                        const eventArgs = this.prepareEventArgs(event, item, args);
                        const context = item.context
                            ? item.context.apply(item.viewController)
                            : item.viewController;
                        if (context.UNSAFE_isReact && !isWasabyEventArgs) {
                            this.wrongCustomEventArguments(reactEventName, props._logicParent);
                        }
                        const res = context[item.value].apply(context, eventArgs);

                        if (eData.length === 1) {
                            result = res;
                        }

                        if (isWasabyEventArgs) {
                            event.result = res;
                        }
                        if (
                            eventArgs &&
                            eventArgs[0]?.isStopped?.() &&
                            event &&
                            event.stopPropagation
                        ) {
                            event.stopPropagation();
                            break;
                        }
                        // из react не передают первым аргументом объект-события, но в обработчики всплытие могут остановить
                        if (
                            eventArgs &&
                            eventArgs[0].type === 'fakeEvent' &&
                            eventArgs[0].stopped
                        ) {
                            break;
                        }
                    } catch (e) {
                        logger.error(e);
                    }
                }
                return result;
            };
            const eData = eventData[key];
            if (
                props[reactEventName] &&
                !props[reactEventName].isWasabyEventCallback &&
                reactEventList.indexOf(reactEventName)
            ) {
                props[getOldReactEventName(reactEventName)] = (event, ...args) => {
                    this.wrongCustomEventArguments(reactEventName, props._logicParent);
                    eventCallbackFn(event, ...args);
                };
                props[getOldReactEventName(reactEventName)].generatedFromCode = true;
                continue;
            }
            props[reactEventName] = eventCallbackFn;
            props[reactEventName].generatedFromCode = true;
            props[reactEventName].isWasabyEventCallback = true;
        }

        return props;
    }

    private static prepareEventArgs(event, item, args) {
        const itemArgs = item.args;
        // если event не объект события, значит в реакте вызывали колбэк без аргументов или согласно API контрола
        // например props.onClick() или props.onClick(value)
        // в таком случае следует создать SyntheticEvent и передать первым аргументом
        if (!event?.target && !(event instanceof SyntheticEvent)) {
            const eventConfig = {
                _bubbling: false,
                type: 'fakeEvent',
                target: null,
            };
            return typeof event === 'undefined'
                ? [new SyntheticEvent(null, eventConfig), ...this.calculateArgs(itemArgs, args)]
                : [
                      new SyntheticEvent(null, eventConfig),
                      ...this.calculateArgs(itemArgs, [event, ...args]),
                  ];
        }
        // в event может быть:
        // - SyntheticEvent
        // - ReactEvent
        // - NativeEvent
        // - фейковый SyntheticEvent
        // если передали фейковый SyntheticEvent, надо его "поправить"
        if (event instanceof SyntheticEvent) {
            const eventConfig = {
                _bubbling: event.isBubbling(),
                type: event.type || 'fakeEvent',
                target: event.target || null,
            };
            return [
                new SyntheticEvent(event.nativeEvent || null, eventConfig),
                ...this.calculateArgs(itemArgs, args),
            ];
        }
        // в event может быть:
        // - ReactEvent
        // - NativeEvent
        return [this.calculateEventObject(event), ...this.calculateArgs(itemArgs, args)];
    }

    private static calculateEventObject(event) {
        let sEvent;
        // событие mouseenter/mouseout в реакте перевернуты, поэтому надо создавать событие из реактовского
        if (!event.nativeEvent || (event.nativeEvent && event.type !== event.nativeEvent.type)) {
            sEvent = new SyntheticEvent(event);
        } else {
            sEvent = new SyntheticEvent(event.nativeEvent);
        }
        sEvent.currentTarget = event.currentTarget;
        if (event.type === 'mouseenter' || event.type === 'mouseout') {
            sEvent.target = event.currentTarget;
        }
        return sEvent;
    }

    private static calculateArgs(itemArgs, args) {
        if (!args) {
            return itemArgs || [];
        }
        if (!itemArgs) {
            return args;
        }
        // Если аргументы есть и в шаблоне, и в нотифае, нужны и те, и те.
        // Причём сначала аргументы из шаблона.
        return [...itemArgs, ...args];
    }

    /**
     * Конвертация результата вызова rk в строку
     * На СП результат метода rk это объект типа String. Его react вставляет посимвольно как
     * S
     * <!-- -->
     * t
     * <!-- -->
     * r
     * что приводит к проблеме гидрации. Поэтому на СП такой объект приведем в строку
     */
    static convertStringChildren<P = {}>(
        props: P & IControlOptions & TJsxProps
    ): P & IControlOptions & TJsxProps {
        return props;
    }
}

if (typeof window === 'undefined') {
    ReactElementIntoTemplate.convertStringChildren = function <P = {}>(
        props: P & IControlOptions & TJsxProps
    ): P & IControlOptions & TJsxProps {
        if (props && props.children && (props.children as { i18n: boolean }).i18n === true) {
            props.children = props.children.toLocaleString();
        }
        return props;
    };
}
