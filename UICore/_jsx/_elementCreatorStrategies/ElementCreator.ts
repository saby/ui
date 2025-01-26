/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import type { IControlOptions } from 'UICommon/Base';
import type { Attr } from 'UICommon/Executor';
import type { TTemplateEventObject } from 'UICore/Events';
import type { TInternalProps } from 'UICore/Executor';
import type { IComponent } from '../partial';

import { Logger } from 'UICommon/Utils';
import { reactEventList, wasabyEventIntersection } from 'UICore/Events';
import {
    mergeAttrs,
    reactAttrNames,
    additionalReactAttrNames,
    wasabyAttrsToReactDom,
    ATTR_STYLE,
    ATTR_DATA_REG_EXP,
} from 'UICore/Executor';
import { ChainOfRef } from 'UICore/Ref';
import { ChildrenPropsModificatorStratagy } from '../ChildrenPropsModificator';
import { useElement } from '../partial';
// список имен пропов, которые не надо воспринимать как событие
const CUSTOMEVENTS_WHITELIST = ['onCaption', 'onEdgesDataChanged'];
const WASABY_EVENT_NAMES = swap(wasabyEventIntersection);

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
    ...propsFromCloneElement
}: IElementCreatorProps): JSX.Element {
    const clearProps = {
        ...childrenAsContentProps,
        ...props,
        ...propsFromCloneElement,
        forwardedRef: ChainOfRef.both(
            childrenAsContentProps?.forwardedRef || propsFromCloneElement?.forwardedRef,
            props.forwardedRef ?? props.$wasabyRef
        ),
        context: undefined,
        $wasabyRef: undefined,
    };
    const events = convertEvents(clearProps);
    const attributes = attributesToWasabyStyle(
        clearProps,
        props,
        childrenAsContentProps,
        propsFromCloneElement
    );

    if (Array.isArray(clearProps.children)) {
        clearProps.children = clearProps.children.filter(isTruthy);
    }

    return useElement(type, clearProps, attributes, events, props.context);
}

interface IStyledProps {
    style?: React.CSSProperties;
}

interface IElementCreatorProps {
    type: IComponent;
    props: TInternalProps<IStyledProps>;
    childrenAsContentProps?: {
        forwardedRef?: React.ForwardedRef<HTMLElement>;
        ref?: React.ForwardedRef<unknown>;
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
    nextRef: React.ForwardedRef<unknown>
): Partial<IElementCreatorProps> {
    const childrenAsContentProps = {
        ...nextProps,
        ref: nextRef,
        attrs: undefined,
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

function convertEvents(props: IControlOptions): TTemplateEventObject {
    const events = {};
    for (const eventName of reactEventList) {
        if (eventName in props) {
            events[WASABY_EVENT_NAMES[eventName]] = [props[eventName]];
        }
    }
    if (props.customEvents || props.ignoreEventProps) {
        return { ...events, ...oldCustomEvents(props) };
    }
    for (const propsName of Object.keys(props)) {
        if (
            /^on[A-Z][A-Za-z]+/g.test(propsName) &&
            typeof props[propsName] === 'function' &&
            !props[propsName].generatedFromCode &&
            CUSTOMEVENTS_WHITELIST.indexOf(propsName) === -1 &&
            reactEventList.indexOf(propsName) === -1
        ) {
            const propNameSuffix = propsName.slice(2);
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
            events[newPropName] = [props[propsName]];
        }
    }

    return events;
}

// обратная совместимость с customEvents
function oldCustomEvents(props) {
    const events = {};
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

/**
 * Приводим атрибуты к васаби-стилю из реактовского
 * @private
 */
function attributesToWasabyStyle(
    props: TInternalProps<IStyledProps> & IControlOptions,
    ...attributesSources: (Partial<TInternalProps<IStyledProps> & IControlOptions> | undefined)[]
): Attr.IAttributes & IStyledProps {
    let attributes = {};
    for (const attributesSource of attributesSources) {
        if (attributesSource) {
            const attributesFromSource = getAttributesFromProps(attributesSource);
            attributes = mergeAttrs(attributesFromSource, attributes);
        }
    }
    if (props.attrs && props.attrs.hasOwnProperty('className')) {
        // Старнный момент, если в атрибутах есть className, то удаляем его из props
        // если не сделать этого, то падают тесты, т.к. уже заложились на такое поведение
        // UPD а если всегда удалять className из пропсов, упадёт другое место. Списки в васаби контроле зачем-то используют className из _options
        delete props.className;
    }
    if (props[ATTR_STYLE] && typeof props[ATTR_STYLE] !== 'string') {
        // удаляем, чтобы точно не долетел через какой-нибудь скоуп до контрола со строковой опцией style.
        delete props[ATTR_STYLE];
    }
    props.attrs = undefined;
    return attributes;
}

function getAttributesFromProps(
    props: TInternalProps<IStyledProps> & IControlOptions
): Attr.IAttributes & IStyledProps {
    const attributes = props.attrs ? wasabyAttrsToReactDom({ ...props.attrs }) : {};
    Object.entries(props).forEach(([propName, propValue]) => {
        if (propName === ATTR_STYLE) {
            // В API контролов есть строковая опция style. В идеале им переименовать опцию, но пока лучше так.
            if (typeof propValue !== 'string') {
                attributes[propName] = propValue;
            }
            return;
        }
        if (
            reactAttrNames.has(propName) ||
            additionalReactAttrNames.has(propName) ||
            ATTR_DATA_REG_EXP.test(propName)
        ) {
            attributes[propName] = propValue;
        }
        // проп не удаляем. пусть пропы летят вдруг мы ошибочно приняли какой-то проп за атрибут
    });
    return attributes;
}

function isTruthy(value: unknown): boolean {
    return !!value;
}
