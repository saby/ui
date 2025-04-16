import { useState, useRef, useCallback } from 'react';

import { EventSubscriber, __notifyFromReact } from 'UICore/Events';

import { default as Notifier } from './Notifier';
import { default as ControlC } from '../ControlC/Index';
import { default as WasabyHOC } from './WasabyHOC';

export default function Index() {
    const [counter, setCounter] = useState<number>(0);
    const [showControlC, setShowControlC] = useState<boolean>(true);
    const [isolateEventScope, setIsolateEventScope] = useState<boolean>(false);

    const rootRef = useRef(null);

    const handler = useCallback(() => {
        setCounter((prev) => prev + 1);
    }, []);

    return (
        <div ref={rootRef}>
            <WasabyHOC>
                <h2>Это Control B</h2>
                <div>Тут мы ДИНАМИЧЕСКИ создаем ControlC и оборачиваем его в EventSubscriber</div>
                <div> - Слушаем событие onBubblingEvent</div>
                <div>Количество вызовов onBubblingEvent: {counter}</div>

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

                <Notifier />

                <div>
                    <button onClick={() => setShowControlC(!showControlC)}>
                        Нажать чтобы {!showControlC ? 'создать' : 'удалить'} ControlC
                    </button>
                </div>

                {showControlC ? (
                    <div>
                        <EventSubscriber
                            onBubblingEvent={handler}
                            isolateEventScope={isolateEventScope}
                        >
                            <ControlC />
                        </EventSubscriber>
                    </div>
                ) : null}
            </WasabyHOC>
        </div>
    );
}
