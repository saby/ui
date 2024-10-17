import { useState } from 'react';

import { EventSubscriber } from 'UICore/Events';

import { default as OtherReactControl } from './OtherReactControl';

export default function ReactComponent() {
    const [counter, setCounter] = useState<number>(0);
    const handler = (e: Event, promise: Promise<void>, confing: {}) => {
        setCounter(counter + 1);
        e.stopPropagation();
    };
    return (
        <div>
            <div>Other Bubbling counter = {counter}</div>
            <EventSubscriber onBubblingEvent={handler}>
                <OtherReactControl />
            </EventSubscriber>
        </div>
    );
}
