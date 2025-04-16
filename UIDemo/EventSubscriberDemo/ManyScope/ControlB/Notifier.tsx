import { useRef, useContext, useCallback } from 'react';

import { __notifyFromReact } from 'UICore/Events';
import { getWasabyContext } from 'UICore/Contexts';

// эмулируем _notify из васаби
export default function Notifier() {
    const rootRef = useRef(null);

    const wasabyContext = useContext(getWasabyContext());

    const callBubblingEvent = useCallback(() => {
        __notifyFromReact(rootRef.current, 'bubblingEvent', [], true, wasabyContext);
    }, [rootRef.current, wasabyContext]);

    return (
        <div ref={rootRef}>
            <button onClick={callBubblingEvent}>
                Нажать чтобы вызвать событие onBubblingEvent
            </button>
        </div>
    );
}
