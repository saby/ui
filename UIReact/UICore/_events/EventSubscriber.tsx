import type { ForwardedRef } from 'react';
import type { Control } from 'UICore/Base';
import { cloneElement, useMemo, createContext, useContext, forwardRef } from 'react';
import { WasabyContextManager, getWasabyContext } from 'UI/Contexts';
import { default as WasabyEvents } from './WasabyEvents';
import { REACT_FAKE_CONTROL } from './PrepareWasabyEvent';

type EventMask = `on${string}`;
interface ISubscriberOptions {
    [key: EventMask]: (...args: any[]) => void;
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

    const contextValue = useMemo(() => {
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

    // в EventSubscriber обернули DOM-элемент
    if (DOMType.includes(props.children.type)) {
        const convertEvents: { [key: string]: Function[] } = {};
        for (const eventName of Object.keys(events)) {
            const name = eventName.slice(2);
            convertEvents['on:' + eventName.slice(2)[0].toLowerCase() + name.slice(1)] = [
                events[eventName],
            ];
        }
        const notifyRef = (node: HTMLElement) => {
            WasabyEvents.getInstance(node).setEventHook(
                convertEvents,
                node,
                REACT_FAKE_CONTROL as unknown as Control
            );
        };
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
        <WasabyContextManager bubblingEvents={contextValue}>
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
