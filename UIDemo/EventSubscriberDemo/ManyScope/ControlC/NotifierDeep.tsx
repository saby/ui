import { useRef, useContext, useCallback } from 'react';

import { __notifyFromReact } from 'UICore/Events';
import { getWasabyContext } from 'UICore/Contexts';

// эмулируем _notify из васаби
export default function Notifier() {
    const rootRef = useRef(null);

    const wasabyContext = useContext(getWasabyContext());

    const callDeepBubblingEvent = useCallback(() => {
        __notifyFromReact(rootRef.current, 'deepBubblingEvent', [], true, wasabyContext);
    }, [rootRef.current, wasabyContext]);

    return (
        <div ref={rootRef}>
            <button onClick={callDeepBubblingEvent}>
                Нажать чтобы вызвать событие onDeepBubblingEvent
            </button>
        </div>
    );
}
