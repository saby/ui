import { useState, useCallback } from 'react';

import { EventSubscriber } from 'UICore/Events';

import { default as ControlB } from '../ControlB/Index';

export default function Index() {
    const [counter, setCounter] = useState<number>(0);
    const [counterDeep, setCounterDeep] = useState<number>(0);
    const [isolateEventScope, setIsolateEventScope] = useState<boolean>(false);

    const handler = useCallback(() => {
        setCounter((prev) => prev + 1);
    }, []);

    const handlerDeep = useCallback(() => {
        setCounterDeep((prev) => prev + 1);
    }, []);

    return (
        <div>
            <h2>Это Control A</h2>
            <div>Тут мы создаем ControlB и оборачиваем его в EventSubscriber</div>
            <div> - Слушаем событие onBubblingEvent</div>
            <div> - Слушаем событие onDeepBubblingEvent</div>
            <div>Количество вызовов onBubblingEvent: {counter}</div>
            <div>Количество вызовов onDeepBubblingEvent: {counterDeep}</div>

            <div>
                <button
                    onClick={() => {
                        setIsolateEventScope(!isolateEventScope);
                    }}
                >
                    Нажать чтобы{' '}
                    {!isolateEventScope ? 'ИЗОЛИРОВАТЬ конекст' : 'СНЯТЬ изоляцию конекста'}{' '}
                    EventSubscriber
                </button>
            </div>

            <div>
                <EventSubscriber
                    onBubblingEvent={handler}
                    onDeepBubblingEvent={handlerDeep}
                    isolateEventScope={isolateEventScope}
                >
                    <ControlB />
                </EventSubscriber>
            </div>
        </div>
    );
}
