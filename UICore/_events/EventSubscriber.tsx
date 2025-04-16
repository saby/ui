/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import type { ForwardedRef } from 'react';
import type { Control } from 'UICore/Base';
import {
    cloneElement,
    useMemo,
    createContext,
    useContext,
    forwardRef,
    useEffect,
    useRef,
} from 'react';
import { WasabyContextManager, getWasabyContext } from 'UICore/Contexts';
import { default as WasabyEvents } from './WasabyEvents';
import { createReactFakeControl } from './PrepareWasabyEvent';
import { logger } from 'Application/Env';

type EventMask = `on${string}`;
type DataMask = `data${string}`;
interface ISubscriberOptions {
    [key: EventMask]: ((...args: any[]) => void) | undefined;
    [key: DataMask]: Function[];
    [key: string]: unknown;
    convertName?: boolean;
    fakeDOM?: boolean;
    isolateEventScope?: boolean;
}
type TSubscriberOptionsKey = keyof ISubscriberOptions;
type TSubscriberOptionsValue = ISubscriberOptions[keyof ISubscriberOptions];

const eventRegexp = /on[A-Z_]([A-Za-z0-9_])+/;
const DOMType = ['div', 'span', 'a'];

const isForwardRef = (component: JSX.Element['type']) =>
    component?.$$typeof?.toString() === 'Symbol(react.forward_ref)';
const isMemo = (component: JSX.Element['type']) =>
    component?.$$typeof?.toString() === 'Symbol(react.memo)';
const isClassComponent = (component: JSX.Element['type']) =>
    typeof component === 'function' &&
    component.prototype &&
    (component.prototype.isReactComponent || component.prototype.isPureReactComponent);

const shouldWrap = (child: JSX.Element): boolean => {
    if (typeof child.type === 'function') {
        if (isForwardRef(child.type) || isMemo(child.type) || isClassComponent(child.type)) {
            return true;
        }
        return false;
    }
    return true;
};

export const BubblingEventContext = createContext<ISubscriberOptions>({});

export default forwardRef(function EventSubscriber(
    props: ISubscriberOptions & { children: JSX.Element },
    ref: ForwardedRef<HTMLElement>
) {
    const { children, ...rest } = props;

    // Проверяем ваилидность опций, если передали что-то не то надо сообщить об этом
    const invalidProps = [];
    const noFunctionProps = [];
    for (const propName of Object.keys(rest)) {
        if (!propName.startsWith('on')) {
            invalidProps.push(propName);
            continue;
        }
        if (typeof rest[propName] === 'undefined') {
            continue;
        }
        if (typeof rest[propName] !== 'function') {
            noFunctionProps.push(propName);
            continue;
        }
    }
    if (invalidProps.length) {
        logger.warn(
            `В EventSubscriber были переданы props отличные от события (props называется не с on*).    
    Проблемные props: ${invalidProps.join(', ')}. 
    Чтобы найти проблему следует воспользоваться React DevTools, проблему следует искать в родитеском контроле.
    Возможная причина в передаче опций скопом (...props) в EventSubscriber.
    `
        );
    }
    if (noFunctionProps.length) {
        logger.error(
            `В EventSubscriber были переданы props, которые не являются колбэк-функциями.
    Проблемные props: ${noFunctionProps.join(', ')}. 
    Чтобы найти проблему следует воспользоваться React DevTools, проблему следует искать в родитеском контроле.
    `
        );
    }

    const wasabyContext = useContext(getWasabyContext());
    const events: { [key: string]: Function } = {};
    const propsEntries = Object.entries(rest) as [TSubscriberOptionsKey, TSubscriberOptionsValue][];
    for (const [propName, propValue] of propsEntries) {
        if ((propName as string).search(eventRegexp) !== -1 && typeof propValue === 'function') {
            events[propName] = propValue;
        }
    }

    const wasabyContextValue = useMemo(() => {
        // Если передан isolateEventScope, всегда создаем новый контекст для событий
        // это нужно в случае когда имена событий пересекуются между вложенными EventSubscriber
        // но по прикладнйо логике требуется регистрация только на 1 уровень
        if (rest.isolateEventScope) {
            const newEvents: { [key: string]: unknown[] } = {};
            for (const item of Object.keys(events)) {
                newEvents[item] = [events[item]];
            }
            return newEvents;
        }

        if (wasabyContext.bubblingEvents) {
            const eventsFromContext = { ...wasabyContext.bubblingEvents };
            for (const item of Object.keys(events)) {
                if (!eventsFromContext[item]) {
                    eventsFromContext[item] = [events[item]];
                    continue;
                }
                if (eventsFromContext[item].includes(events[item])) {
                    continue;
                }
                eventsFromContext[item].unshift(events[item]);
            }
            return eventsFromContext;
        }
        const newEvents: { [key: string]: unknown[] } = {};
        for (const item of Object.keys(events)) {
            newEvents[item] = [events[item]];
        }
        return newEvents;
    }, [props.isolateEventScope, ...Object.values(events)]);

    // BubblingEventContext должен содержать информацию о подписках с разных уровней,
    // например 3 разных EventSubscriber добавляют подписку на событие onEvent
    // в react вызывают BubblingEventContext.onEvent(arg1, arg2)
    // в таком случае надо вызывать колбэки onEvent со всех трех подписок
    // чтобы не было утечки колбэк-обертку (которую вызывают) и сами обработчики храним отдельно
    // в таком случае мы всегдма будет в контексте держать только актуальные обработчики
    const outerBubblingEventContext = useContext(BubblingEventContext);
    const contextValue = useMemo(() => {
        if (typeof window === 'undefined') {
            return {};
        }

        // если передали проп isolateEventScope, значит надо создать чистый контекст
        if (rest.isolateEventScope) {
            const newEvents: ISubscriberOptions = {};
            for (const item of Object.keys(events)) {
                const eventDataName: DataMask = `data${item.slice(2)}`;
                newEvents[eventDataName as DataMask] = [events[item]];
                newEvents[item as EventMask] = function callback() {
                    for (const eventCallback of newEvents[eventDataName]) {
                        eventCallback(...arguments);
                    }
                };
            }
            return newEvents;
        }
        const newEvents: ISubscriberOptions = outerBubblingEventContext || {};
        for (const item of Object.keys(events)) {
            const eventDataName: DataMask = `data${item.slice(2)}`;
            if (outerBubblingEventContext?.[eventDataName]) {
                if (outerBubblingEventContext[eventDataName].includes(events[item])) {
                    continue;
                }
                newEvents[eventDataName as DataMask].unshift(events[item]);
                continue;
            }

            // колбэк-обертка
            newEvents[item as EventMask] = function callback() {
                for (const eventCallback of outerBubblingEventContext[eventDataName]) {
                    eventCallback(...arguments);
                }
            };
            // массив обработчиков
            newEvents[eventDataName as DataMask] = [events[item]];
        }
        return newEvents;
    }, [props.isolateEventScope, outerBubblingEventContext, ...Object.values(events)]);

    const notifyInnerRef = useRef<HTMLElement>();
    // Создаём каждый раз новый на новый рендер, потому что
    // notifyRef, useEffect вызываются именно в таком порядке
    const fakeControl = createReactFakeControl();
    const convertEvents: { [key: string]: Function[] } = {};

    // Выстрелит всегда до useEffect, т.к. срабатывает у детей, а не у себя в render
    const notifyRef = (node: HTMLElement) => {
        if (!node) {
            const element = notifyInnerRef.current as HTMLElement;
            WasabyEvents.getInstance(node).removeReactNativeEvent(element, events);
            return;
        }
        WasabyEvents.getInstance(node).setEventHook(
            convertEvents,
            node,
            fakeControl as unknown as Control
        );
        notifyInnerRef.current = node;
    };

    // Чистим события на предидущем fakeControl
    useEffect(() => {
        return () => {
            /* нужно почистить фейковый контрол от событий при обновлении и анмауте,
             обычно это делает базовый wasaby - контрол,
            но в данном кейсе он не создается и подписки остаются */
            if (fakeControl._$notifyEvents.size) {
                // вызываем натвиные отписки
                fakeControl._$notifyEvents.forEach((nodeMap) => {
                    nodeMap.forEach((events) => {
                        for (const eventName of Object.keys(events)) {
                            events[eventName].removeListener();
                        }
                    });
                });
                fakeControl._$notifyEvents.clear();
            }
            // очищаем BubblingEventContext от мусора
            for (const item of Object.keys(events)) {
                const eventDataName: DataMask = `data${item.slice(2)}`;
                const index = outerBubblingEventContext[eventDataName]?.indexOf(events[item]);
                if (outerBubblingEventContext?.[eventDataName] && index !== -1) {
                    outerBubblingEventContext[eventDataName as DataMask].splice(index, 1);
                }
            }
        };
    });

    // в EventSubscriber обернули DOM-элемент
    if (DOMType.includes(children.type) || (rest.fakeDOM && shouldWrap(children))) {
        for (const eventName of Object.keys(events)) {
            const name = eventName.slice(2);
            convertEvents['on:' + eventName.slice(2)[0].toLowerCase() + name.slice(1)] = [
                events[eventName],
            ];
        }

        // если передали свойство fakeDOM значит передать в конетнт EventSubscriber DOM-элемент нельзя
        // но нужна логика работы как с корневым DOM-элементом, чтобы порядок регистрации событий был как в wasaby
        // например в списках использовать корневой div нельзя, т.к. ломаются каскадные селекторы
        // но нужно сохранять порядок регистрации валидаторов
        if (rest.fakeDOM) {
            return (
                <WasabyContextManager bubblingEvents={wasabyContextValue}>
                    <BubblingEventContext.Provider value={contextValue}>
                        {cloneElement(children, {
                            ref: mergeRefs([ref, notifyRef]),
                        })}
                    </BubblingEventContext.Provider>
                </WasabyContextManager>
            );
        }
        return (
            <BubblingEventContext.Provider value={contextValue}>
                {cloneElement(children, {
                    ref: mergeRefs([ref, notifyRef]),
                })}
            </BubblingEventContext.Provider>
        );
    }

    // внутри строится wasaby, добавляем в пропсы события, их извлечем и зачейним в реф позже в ElementCreator
    if (children.props.props) {
        const childrenProps = { ...children.props };
        childrenProps.props.customEvents = Object.keys(events);
        childrenProps.props.customEventsPreventConvertName = !!(rest.convertName === false);
        childrenProps.props = { ...childrenProps.props, ...events };
        return (
            <BubblingEventContext.Provider value={contextValue}>
                {cloneElement(children, { ...childrenProps })}
            </BubblingEventContext.Provider>
        );
    }

    // внутри строится реакт
    // в этом случае нет смысла прокидывать пропсы, надо только обернуть в контекст
    return (
        <WasabyContextManager bubblingEvents={wasabyContextValue}>
            <BubblingEventContext.Provider value={contextValue}>
                {children}
            </BubblingEventContext.Provider>
        </WasabyContextManager>
    );
});

function mergeRefs<T = any>(
    refs: (React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null)[]
): React.RefCallback<T> {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}
