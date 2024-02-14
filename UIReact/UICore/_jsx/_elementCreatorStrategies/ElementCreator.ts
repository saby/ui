import type { IControlOptions } from 'UICommon/Base';
import type { Attr } from 'UICommon/Executor';
import type { TTemplateEventObject } from 'UICore/Events';
import type { TInternalProps } from 'UICore/Executor';
import type { IComponent } from '../partial';

import { Logger } from 'UICommon/Utils';
import { reactEventList, wasabyEventIntersection } from 'UICore/Events';
import { mergeAttrs, wasabyToReactAttrNames } from 'UICore/Executor';
import { ChainOfRef } from 'UICore/Ref';
import { ChildrenPropsModificatorStratagy } from '../ChildrenPropsModificator';
import { useElement } from '../partial';

const CUSTOMEVENTS_WHITELIST = ['onCaption'];

/**
 * Создание стратегии модификации пропсов ElementCreator-а.
 * Иначе говоря, когда Васаби вставляется как children другого Васаби в tsx.
 * Переносит все пропсы, прилетевшие из wml, в childrenAsContentProps ElementCreator-а.
 * My.tsx
 * <WasabyControl>
 *     <AnotherWasabyControl className="anotherWasabyControl" />
 * </WasabyControl>
 * @private
 */
export const elementCreatorStrategy = new ChildrenPropsModificatorStratagy(
    isElementCreatorChild,
    modifyElementCreatorProps
);

/**
 * Компонент, рисующий Васаби контрол или шаблон через генератор.
 * @private
 */
export default function ElementCreator({
    type,
    props,
    childrenAsContentProps,
    forwardedRef,
}: IElementCreatorProps): JSX.Element {
    const clearProps = {
        ...childrenAsContentProps,
        ...props,
        attrs: undefined,
        context: undefined,
        $wasabyRef: undefined,
    };
    const events = convertEvents(clearProps);
    let attributes = attributesToWasabyStyle(props);
    if (childrenAsContentProps) {
        attributes = mergeAttrs(attributesToWasabyStyle(childrenAsContentProps), attributes);
    }
    const elementForwardedRef = ChainOfRef.both(
        childrenAsContentProps?.forwardedRef || forwardedRef,
        props.forwardedRef ?? props.$wasabyRef
    );

    if (props.attrs && props.attrs.hasOwnProperty('className')) {
        // Старнный момент, если в атрибутах есть className, то удаляем его из props
        // если не сделать этого, то падают тесты, т.к. уже заложились на такое поведение
        delete clearProps.className;
    }

    clearProps.forwardedRef = elementForwardedRef;

    return useElement(type, clearProps, attributes, events, props.context);
}

interface IElementCreatorProps {
    type: IComponent;
    props: TInternalProps;
    childrenAsContentProps?: {
        forwardedRef: React.ForwardedRef<HTMLElement>;
    };
    forwardedRef?: React.ForwardedRef<HTMLElement>;
}

type TElementCreator = React.FC<IElementCreatorProps>;

/**
 * Для использования в childrenPropsModificator
 * @private
 */
function isElementCreatorChild(
    children: React.ReactElement
): children is React.ReactElement<IElementCreatorProps, TElementCreator> {
    return children.type === ElementCreator;
}

/**
 * Для использования в childrenPropsModificator
 * @private
 */
function modifyElementCreatorProps(
    children: React.ReactElement<IElementCreatorProps, TElementCreator>,
    nextProps: IElementCreatorProps & {
        children: unknown;
        content: unknown;
    },
    nextRef: React.ForwardedRef<HTMLElement>
): Partial<IElementCreatorProps> {
    const childrenAsContentProps = {
        ...nextProps,
        forwardedRef: nextRef,
    };
    delete childrenAsContentProps.children;
    delete childrenAsContentProps.content;

    return {
        childrenAsContentProps,
    };
}

function swap(map: object) {
    const ret = {};
    for (const key in map) {
        if (!map.hasOwnProperty(key)) {
            continue;
        }
        ret[map[key]] = key;
    }
    return ret;
}

const WASABY_EVENT_NAMES = swap(wasabyEventIntersection);

function convertEvents(props: IControlOptions): TTemplateEventObject {
    const events = {};
    for (const eventName of reactEventList) {
        if (eventName in props) {
            events[WASABY_EVENT_NAMES[eventName]] = [props[eventName]];
        }
    }
    if (!props.customEvents) {
        return events;
    }
    for (const eventName of props.customEvents) {
        if (!checkEventException(eventName)) {
            continue;
        }
        if (eventName.indexOf(':') > -1) {
            Logger.error(
                'Передано не правильное имя события в customEvents (' +
                    eventName +
                    '), следует использовать camelCase'
            );
            continue;
        }
        if (eventName.search('^on[A-Z]') === 0) {
            if (!props[eventName]) {
                Logger.warn(
                    'Обработчик события "' + eventName + '" не был найден среди переданных опций'
                );
                continue;
            }
            if (typeof props[eventName] !== 'function') {
                Logger.error('Опция "' + eventName + '" не является обработчиком функции');
                continue;
            }
            const propNameSuffix = eventName.slice(2);
            // customEventsPreventConvertName - специальный prop, который задают в EventSubscriber
            // нужно для того чтобы сохранить регистр события
            // по-умолчанию события должны быть в lowerCamelCase
            // но появилась необходимость сохранить имя события вида STEvent
            const newPropName =
                'on:' +
                (!props.customEventsPreventConvertName
                    ? propNameSuffix[0].toLowerCase()
                    : propNameSuffix[0]) +
                propNameSuffix.slice(1);
            events[newPropName] = [props[eventName]];
        }
    }
    return events;
}

// prop customEvents нужен для того чтобы из реакта в васаби сообщить о том что какое-то свойство является событием
// если все on свойства считать событиями, то черезе ...props леитит много событий, их "фильтруют" с помощью customEvents,
// получается что события продолжают спускаться в скопе опций, но в объект события попадают только из customEvents
// пока следует поддержать легаси поведение
function checkEventException(eventName) {
    return CUSTOMEVENTS_WHITELIST.indexOf(eventName) === -1;
}

const dataRegexp = /data(-\w+)+/;
const reactAttrNames = new Set(Object.values(wasabyToReactAttrNames));
/**
 * Приводим атрибуты к васаби-стилю из реактовского
 * @private
 */
function attributesToWasabyStyle(props: TInternalProps & IControlOptions): Attr.IAttributes {
    const attributes: Attr.IAttributes = props.attrs || {};
    Object.keys(props).forEach((propName: string) => {
        if (reactAttrNames.has(propName) || propName.search(dataRegexp) !== -1) {
            attributes[propName] = props[propName];
        }
        // проп не удаляем. пусть пропы летят вдруг мы ошибочно приняли какой-то проп за атрибут
    });
    return attributes;
}
