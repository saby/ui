import { ASYNC_LOADING_TEST_INDICATOR } from './Control/LoaderIndicator';

let originalResizeObserver;
let overrideObserver;

export function initResizeObserver(): void {
    if (
        typeof ResizeObserver === 'undefined' ||
        (overrideObserver && ResizeObserver instanceof overrideObserver)
    ) {
        return;
    }
    originalResizeObserver = ResizeObserver;
    overrideObserver = (callback: ResizeObserverCallback): ResizeObserver => {
        const overrideCallback = (
            entries: ResizeObserverEntry[],
            observer: ResizeObserver
        ): void => {
            const loadingControlElement = entries[0].target.querySelector(
                `[name="${ASYNC_LOADING_TEST_INDICATOR}"]`
            );
            if (!loadingControlElement) {
                return callback(entries, observer);
            }
            const control = loadingControlElement?.controlNodes[0].control;
            const _observerCallback = () => {
                callback(entries, observer);
                delete control._$observerCallback;
            };
            control._$observerCallback = _observerCallback;
            return;
        };
        return new originalResizeObserver.prototype.constructor(
            overrideCallback
        );
    };
    overrideObserver.prototype = originalResizeObserver.prototype;
    ResizeObserver = overrideObserver;
}
