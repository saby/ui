/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { logger } from 'Application/Env';
import type { IGeneratorAttrs } from '../interfaces';
import type { Control } from 'UICore/Base';
import type { IControlOptions } from 'UICommon/Base';
import { wasabyEventIntersection, isCustomEvent } from 'UICore/Events';
import { CreateFocusCallbacksRef, IFocusChangedConfig } from 'UICore/Focus';
import { SyntheticEvent } from 'UICommon/Events';
import { WasabyContextManager } from 'UICore/Contexts';
import { mergeAttrs } from '../../_Utils/Attr';
import ContentAsChildren from './ContentAsChildren';

const REACT_FIBER_FIELD = '$$typeof';
const SYMBOL_REACT_ELEMENT = Symbol.for('react.element');
// const SYMBOL_REACT_MEMO = Symbol.for('react.memo');
const WML_ONLY_GENERATED_KEYS = [
    '_$internal',
    '_$events',
    '_$blockOptionNames',
    '_$attributes',
];

export function isReactElement(
    component: unknown
): component is React.ReactElement {
    // return component && Object.getPrototypeOf(component.constructor) === React.Component;
    return component && component[REACT_FIBER_FIELD] === SYMBOL_REACT_ELEMENT;
}

export function isComponentClass(
    component: any
): component is React.ComponentClass {
    const prototype = component?.prototype;
    if (prototype) {
        return typeof prototype.render === 'function';
    }
    return false;
}

export function isMemizedOrForwardFunctionComponent(
    component: unknown
): component is React.ExoticComponent {
    return component && !!component[REACT_FIBER_FIELD];
}

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
        isMemizedOrForwardFunctionComponent(content)
    );
}

const noPropsComponentLength = 0;
const withPropsComponentLength = 1;

function isFunctionComponent(
    component: unknown
): component is React.FunctionComponent {
    if (typeof component !== 'function') {
        return false;
    }
    // Главная задача isFunctionComponent - отличить функциональный компонент от шаблонной функции.
    // У шаблонной функции всегда 7 аргументов, у функционального компонента - 0 или 1.
    // Никак иначе функциональный компонент от какой-то другой функции не отличить (разве что флаги вешать).
    return (
        component.length === noPropsComponentLength ||
        component.length === withPropsComponentLength
    );
}

type TRefType = (node?: any) => void;
export type TJsxProps<P = unknown> = P & {
    name?: string;
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
import { CreateFocusRef } from 'UICore/_executor/_Markup/Refs/CreateFocusRef';

export interface ITemplateAttrs extends IGeneratorAttrs {
    refForContainer: TRefType;
    /**
     * Признак вызова функции генератора из tsx
     */
    isReactWrapper?: true;
}

/**
 * Класс для создания $wasabyRef для чистого ReactComponent | ReactFunctionalComponent.
 * Он дублирует логику, которая должна вызвается в wml при создании ref который вешается на DOMElement.
 */
export class WasabyDOMRefGeneration {
    /**
     * @param refForContainer   ref, сформированный для выставления _container Wasaby-контрола.
     * @param forwardedRef  это может быть как перенаправленный ref, напр. refForContainer от какого-то Wasaby-родителя,
            так и ref созданный в createControlNew -> calculateOptions, как childrenRef.
            Поэтому при формировании нового forwardedRef этот ref нужно примешать в цепочку с refForContainer.
     */
    constructor(
        private refForContainer: TRefType,
        private forwardedRef: TRefType
    ) {}

    generate(events: TEventObject, props: any) {
        const chainOfRef = new ChainOfRef();
        // Создания рефа вызова колбеков смены активности. Важно до создания рефа событий.
        const createFocusCallbacksRef = this.createFocusCallbacksRef(
            props,
            events
        );
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
        const createNotifyRef = new CreateNotifyRef(customEvents);
        // @ts-ignore
        _FocusAttrs.prepareAttrsForFocus(props.attrs);
        // @ts-ignore
        const сreateFocusRef = new CreateFocusRef(
            _FocusAttrs.extractFocusAttributes(props.attrs)
        );

        if (createFocusCallbacksRef) {
            chainOfRef.add(createFocusCallbacksRef);
        }
        chainOfRef.add(createNotifyRef);
        if (this.refForContainer) {
            chainOfRef.add(new CreateOriginRef(this.refForContainer));
        }
        chainOfRef.add(сreateFocusRef);
        if (this.forwardedRef) {
            chainOfRef.add(new CreateOriginRef(this.forwardedRef));
        }
        return chainOfRef.execute();
    }

    // TODO отвязать activated/decativated от системы событий, удалить метод.
    private createFocusCallbacksRef(
        props: any,
        events: Record<string, unknown>
    ): CreateFocusCallbacksRef {
        let onActivated: (cfg: IFocusChangedConfig) => void;
        // Ранее в prepareEvents для каждого события сгенерировался колбек проп. Используем его.
        if (events['on:activated']) {
            onActivated = (cfg: IFocusChangedConfig) => {
                props.onActivated({}, cfg);
            };
            delete events['on:activated'];
        }
        let onDeactivated: (cfg: IFocusChangedConfig) => void;
        if (events['on:deactivated']) {
            onDeactivated = (cfg: IFocusChangedConfig) => {
                props.onDeactivated({}, cfg);
            };
            delete events['on:deactivated'];
        }
        if (onActivated || onDeactivated) {
            return new CreateFocusCallbacksRef(onActivated, onDeactivated);
        }
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
    isRelevant(component: unknown): component is React.ComponentClass {
        return (
            isComponentClass(component) ||
            isFunctionComponent(component) ||
            isMemizedOrForwardFunctionComponent(component)
        );
    }

    /**
     * Создание ReactElement из React.ComponentClass в wml окружении
     * @param logicParent
     * @param physicParent не используется. Нацелен на интерфейс
     * @param component React.ComponentClass
     * @param props
     * @param templateAttrs
     * @returns
     */
    private create<P = {}>(
        component:
            | React.ComponentClass<P & IControlOptions>
            | React.FunctionComponent<P & IControlOptions>,
        props: P & IControlOptions & TJsxProps,
        isVdom: boolean
    ): React.ReactElement {
        props = ReactElementIntoTemplate.convertStringChildren(props);

        // Может быть ситуация, когда children прокинули через скоуп.
        // Так что если children уже есть и является ContentAsChildren - перепишем для текущего контента.
        const content = props.content;
        if (
            isValidContent(content) &&
            (!props.children ||
                (React.isValidElement(props.children) &&
                    props.children.type === ContentAsChildren))
        ) {
            props.children = React.createElement(ContentAsChildren, {
                content,
            });
        }
        const children = React.createElement(component, props);

        // Необходимо обернуть чистый реакт, вставленный в wml, в WasabyContextManager.
        // 1. в чистом реакте не придётся смотреть prop.theme, актуальная тема всегда будет в контексте.
        // 2. Если тема изменится на уровне конкретного реакт компонента, её прокидывание ниже не потеряется.
        // Тема только для примера, это касается всех опций из WasabyContextManager.
        const reactElement = React.createElement(WasabyContextManager, {
            key: props.key + 'c_',
            readOnly: props.readOnly,
            theme: props.theme,
            _physicParent: props._physicParent,
            _logicParent: props._logicParent,
            _parentKey: props.rskey,
            pageData: props.pageData,
            Router: props.Router,
            isAdaptive: props.isAdaptive,
            adaptiveMode: props.adaptiveMode,
            moduleName: component.displayName || component.name || 'unknown',
            children,
        });
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
        if (!!templateAttrs.isReactWrapper) {
            return forwardedRef;
        }

        // см. описание WasabyDOMRefGeneration
        return (
            new WasabyDOMRefGeneration(
                templateAttrs.refForContainer,
                forwardedRef
            )
                // @ts-ignore
                .generate(templateAttrs.events, props)
        );
    }

    createFnComponent<P = {}>(
        component:
            | React.ComponentClass<P & IControlOptions>
            | React.FunctionComponent<P & IControlOptions>,
        props: P & IControlOptions & TJsxProps,
        templateAttrs: ITemplateAttrs,
        isVdom: boolean
    ): React.ReactElement {
        if (props.onAfterUpdate) {
            Promise.resolve().then(props.onAfterUpdate);
        }
        const finalProps = ReactElementIntoTemplate.createProps<P & TJsxProps>(
            props,
            templateAttrs
        );

        // здесь finalProps.ref может быть как перенаправленный ref,
        // так и ref созданный в createControlNew -> calculateOptions, как childrenRef
        // поэтому при формировании нового forwardedRef этот finalProps.ref нужно примешать в цепочку с refForContainer
        finalProps.$wasabyRef = finalProps.ref = this.createWasabyRef(
            templateAttrs,
            finalProps,
            finalProps.$wasabyRef || finalProps.ref
        );

        return this.create(component, finalProps, isVdom);
    }

    createComponent<P = {}>(
        component:
            | React.ComponentClass<P & IControlOptions>
            | React.FunctionComponent<P & IControlOptions>,
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
        const finalProps = ReactElementIntoTemplate.createProps<P & TJsxProps>(
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
            props.$wasabyRef || props.forwardedRef
        );
        return this.create(component, finalProps, isVdom);
    }

    private static createProps<P>(
        templateScope: P,
        templateAttrs: ITemplateAttrs
    ): P & TJsxProps {
        const props: P & TJsxProps =
            ReactElementIntoTemplate.copyFromPrototype(templateScope);
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

    private static isNativeFunction(handler): handler is TEventObject {
        return handler instanceof Function;
    }

    /**
     * Подготавливаем именя событий из on:click к onClick в props, когда в контентной опции React.Element
     * TODO перенести в генератор, что бы можно было в нативных элементах
     *  из Executor.createElement передавать события в props
     */
    private static prepareEvents<P>(
        props: P,
        eventData: Record<string, TWasabyEvent[]>
    ): P {
        const events = Object.keys(eventData);
        for (const key of events) {
            const _event = key.split(':');
            // метаданные событий нам не нужны
            if (_event[0] === 'meta') {
                continue;
            }
            let reactEventName;
            if (Object.keys(wasabyEventIntersection).indexOf(key) === -1) {
                reactEventName =
                    'on' +
                    _event[1].charAt(0).toUpperCase() +
                    _event[1].slice(1);
            } else {
                reactEventName = wasabyEventIntersection['on:' + _event[1]];
            }

            const eData = eventData[key];
            props[reactEventName] = (event, ...args) => {
                for (const item of eData) {
                    if (ReactElementIntoTemplate.isNativeFunction(item)) {
                        props[reactEventName] = eData;
                        // @ts-ignore сюда передали руками нативное событие
                        item(event);
                        continue;
                    }
                    if (item?.hasOwnProperty('bindValue')) {
                        // args всегда массив, а бинд работает с примитивами
                        let newValue = args[0];
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
                        const eventArgs = this.prepareEventArgs(
                            event,
                            item.args,
                            args
                        );
                        const context = item.context
                            ? item.context.apply(item.viewController)
                            : item.viewController;
                        const res = context[item.value].apply(
                            context,
                            eventArgs
                        );

                        if (event instanceof SyntheticEvent) {
                            event.result = res;
                        }
                        if (eventArgs && eventArgs[0]?.isStopped?.()) {
                            event.stopPropagation();
                            break;
                        }
                    } catch (e) {
                        logger.error(e);
                    }
                }
            };
        }

        return props;
    }

    private static prepareEventArgs(event, itemArgs, args) {
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

    private static calculateEventObject(event) {
        let sEvent;
        // событие mouseenter/mouseout в реакте перевернуты, поэтому надо создавать событие из реактовского
        if (
            !event.nativeEvent ||
            (event.nativeEvent && event.type !== event.nativeEvent.type)
        ) {
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
        if (
            props &&
            props.children &&
            (props.children as { i18n: boolean }).i18n === true
        ) {
            props.children = props.children.toLocaleString();
        }
        return props;
    };
}
