/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import type { ForwardedRef } from 'react';
import type { Control } from 'UICore/Base';
import { cloneElement, useMemo, createContext, useContext, forwardRef, useEffect } from 'react';
import { WasabyContextManager, getWasabyContext } from 'UICore/Contexts';
import { default as WasabyEvents } from './WasabyEvents';
import { createReactFakeControl } from './PrepareWasabyEvent';

type EventMask = `on${string}`;
type DataMask = `data${string}`;
interface ISubscriberOptions {
    [key: EventMask]: (...args: any[]) => void;
    [key: DataMask]: Function[];
    convertName?: boolean;
    fakeDOM?: boolean;
    isolateEventScope?: boolean;
}

const eventRegexp = /on[A-Z_]([A-Za-z0-9_])+/;
const DOMType = ['div', 'span', 'a'];

export const BubblingEventContext = createContext<ISubscriberOptions>({});

export default forwardRef(function EventSubscriber(
    props: ISubscriberOptions & { children: JSX.Element },
    ref: ForwardedRef<HTMLElement>
) {
    const isForwardRef = (component: JSX.Element) =>
        component?.$$typeof?.toString() === 'Symbol(react.forward_ref)';
    const isMemo = (component: JSX.Element) =>
        component?.$$typeof?.toString() === 'Symbol(react.memo)';
    const isClassComponent = (component: JSX.Element) =>
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

    const wasabyContext = useContext(getWasabyContext());
    const events: { [key: string]: Function } = {};
    for (const propName of Object.keys(props)) {
        if (propName.search(eventRegexp) !== -1 && typeof props[propName] === 'function') {
            events[propName] = props[propName];
        }
    }

    const wasabyContextValue = useMemo(() => {
        // Если передан isolateEventScope, всегда создаем новый контекст для событий
        // это нужно в случае когда имена событий пересекуются между вложенными EventSubscriber
        // но по прикладнйо логике требуется регистрация только на 1 уровень
        if (props.isolateEventScope) {
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
        if (props.isolateEventScope) {
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

    const fakeControl = createReactFakeControl();
    const convertEvents: { [key: string]: Function[] } = {};

    const notifyRef = (node: HTMLElement) => {
        if (!node) {
            WasabyEvents.getInstance(node).removeReactNativeEvent(notifyRef.current, events);
            return;
        }
        WasabyEvents.getInstance(node).setEventHook(
            convertEvents,
            node,
            fakeControl as unknown as Control
        );
        notifyRef.current = node;
    };

    useEffect(() => {
        return () => {
            // нужно почистить фейковый контрол от событий при анмауте, обычно это делает базовый wasaby-контрол,
            // но в данном кейсе он не создается и подписки остаются
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
    }, [notifyRef]);

    // в EventSubscriber обернули DOM-элемент
    if (DOMType.includes(props.children.type) || (props.fakeDOM && shouldWrap(props.children))) {
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
        if (props.fakeDOM) {
            return (
                <WasabyContextManager bubblingEvents={wasabyContextValue}>
                    <BubblingEventContext.Provider value={contextValue}>
                        {cloneElement(props.children, {
                            ref: mergeRefs([ref, notifyRef]),
                        })}
                    </BubblingEventContext.Provider>
                </WasabyContextManager>
            );
        }
        return (
            <BubblingEventContext.Provider value={contextValue}>
                {cloneElement(props.children, {
                    ref: mergeRefs([ref, notifyRef]),
                })}
            </BubblingEventContext.Provider>
        );
    }

    // внутри строится wasaby, добавляем в пропсы события, их извлечем и зачейним в реф позже в ElementCreator
    if (props.children.props.props) {
        const childrenProps = { ...props.children.props };
        childrenProps.props.customEvents = Object.keys(events);
        childrenProps.props.customEventsPreventConvertName = !!(props.convertName === false);
        childrenProps.props = { ...childrenProps.props, ...events };
        return (
            <BubblingEventContext.Provider value={contextValue}>
                {cloneElement(props.children, { ...childrenProps })}
            </BubblingEventContext.Provider>
        );
    }

    // внутри строится реакт
    // в этом случае нет смысла прокидывать пропсы, надо только обернуть в контекст
    return (
        <WasabyContextManager bubblingEvents={wasabyContextValue}>
            <BubblingEventContext.Provider value={contextValue}>
                {props.children}
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
