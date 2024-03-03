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
}

const eventRegexp = /on[A-Z_]([A-Za-z0-9_])+/;
const DOMType = ['div', 'span', 'a'];

export const BubblingEventContext = createContext<ISubscriberOptions>({});

export default forwardRef(function EventSubscriber(
    props: ISubscriberOptions & { children: JSX.Element },
    ref: ForwardedRef<HTMLElement>
) {
    const wasabyContext = useContext(getWasabyContext());
    const events: { [key: string]: Function } = {};
    for (const propName of Object.keys(props)) {
        if (propName.search(eventRegexp) !== -1 && typeof props[propName] === 'function') {
            events[propName] = props[propName];
        }
    }

    const wasabyContextValue = useMemo(() => {
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
    }, [props]);

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
    }, [props]);

    const fakeControl = createReactFakeControl();
    const convertEvents: { [key: string]: Function[] } = {};

    const notifyRef = (node: HTMLElement) => {
        if (!node) {
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
                const index = outerBubblingEventContext[eventDataName].indexOf(events[item]);
                if (outerBubblingEventContext?.[eventDataName] && index !== -1) {
                    outerBubblingEventContext[eventDataName as DataMask].splice(index, 1);
                }
            }
        };
    }, [notifyRef]);

    // в EventSubscriber обернули DOM-элемент
    if (DOMType.includes(props.children.type)) {
        for (const eventName of Object.keys(events)) {
            const name = eventName.slice(2);
            convertEvents['on:' + eventName.slice(2)[0].toLowerCase() + name.slice(1)] = [
                events[eventName],
            ];
        }

        return (
            <BubblingEventContext.Provider value={contextValue}>
                {cloneElement(props.children, {
                    ...props.children.props,
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
