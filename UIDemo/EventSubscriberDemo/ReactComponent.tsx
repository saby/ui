import { useState, useContext } from 'react';

import { EventSubscriber, BubblingEventContext } from 'UICore/Events';

import { default as WasabyControl } from './WasabyControl';
import { default as WasabyChildren } from './WasabyChildren';

export default function ReactComponent() {
    const [counter, setCounter] = useState<number>(0);
    const handler = (e: Event, promise: Promise<void>, confing: {}) => {
        setCounter(counter + 1);
    };
    return (
        <div>
            <div>React control</div>
            <div>Bubbling counter = {counter}</div>
            {/*
                в васаби шаблоне это выглядело так
                <UIDemo.MyDemo.WasabyControl on:bubblingEvent="handler()" />
            */}
            {/* шаг 1. перевели на реакт верхний контрол. внизу все васаби */}
            <div>
                <EventSubscriber onBubblingEvent={handler}>
                    <WasabyControl />
                </EventSubscriber>
            </div>
            {/* шаг 2. перевели на реакт верхний контрол. и его первого ребенка. ниже ребенка все васаби */}
            <div>
                <EventSubscriber onBubblingEvent={handler}>
                    <ReactControl />
                </EventSubscriber>
            </div>
            {/* шаг 3. перевели все на реакт верхний контрол. */}
            <div>
                <EventSubscriber onBubblingEvent={handler}>
                    <ReactControlFull />
                </EventSubscriber>
            </div>
        </div>
    );
}

// old WasabyControl
function ReactControl() {
    return (
        <div>
            React Control (old wasaby control)
            <div>
                <WasabyChildren />
            </div>
        </div>
    );
}
function ReactControlFull() {
    return (
        <div>
            React Control (old wasaby control)
            <div>
                <ReactChildren />
            </div>
        </div>
    );
}

//old WasabyChildren
function ReactChildren() {
    const bubblingEventContext = useContext(BubblingEventContext);
    const handler = () => {
        bubblingEventContext.onBubblingEvent();
    };
    return <div onClick={handler}>React children (old wasaby children)</div>;
}
