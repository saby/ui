import { memo, cloneElement } from 'react';

type EventMask = `on${string}`;

interface ISubscriberOptions {
    [key: EventMask]: (...args: unknown[]) => void;
    convertName?: boolean;
}

const eventRegexp = /on[A-Z]([A-Za-z0-9_])+/;
const EventSubscriber = (props: ISubscriberOptions & { children: JSX.Element }) => {
    const events = {};
    for (const propName of Object.keys(props)) {
        if (propName.search(eventRegexp) !== -1) {
            events[propName] = props[propName];
        }
    }
    const childrenProps = { ...props.children.props };
    childrenProps.props.customEvents = Object.keys(events);
    childrenProps.props.customEventsPreventConvertName = !!(props.convertName === false);
    childrenProps.props = { ...childrenProps.props, ...events };
    return cloneElement(props.children, { ...childrenProps });
};

export default memo(EventSubscriber);
