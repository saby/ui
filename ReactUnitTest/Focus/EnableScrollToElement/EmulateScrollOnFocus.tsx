import { useCallback, FocusEvent } from 'react';
export default function EmulateScrollOnFocus(): JSX.Element {
    // jsdom не умеет делать нативный подскролл при фокусировке.
    // Наверное, такого костыля будет достаточно для проверки.
    const onFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
        let elem: Element = event.target;
        while (elem) {
            elem.scrollTop = 1;
            elem.scrollLeft = 1;
            elem = elem.parentElement;
        }
    }, []);

    return (
        <div onFocus={onFocus}>
            <div id="scrolledElement">
                <input id="input" type="text" />
            </div>
        </div>
    );
}
