let originalIntersectionObserver;
let overrideObserver;

export function initIntersectionObserver(): void {
    if (
        typeof IntersectionObserver === 'undefined' ||
        (overrideObserver && IntersectionObserver instanceof overrideObserver)
    ) {
        return;
    }
    originalIntersectionObserver = IntersectionObserver;
    overrideObserver = (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
    ): IntersectionObserver => {
        const overrideCallback = (
            entries: IntersectionObserverEntry[],
            observer: IntersectionObserver
        ): void => {
            return callback(entries, observer);
        };
        return new originalIntersectionObserver.prototype.constructor(
            overrideCallback,
            options
        );
    };
    overrideObserver.prototype = originalIntersectionObserver.prototype;
    IntersectionObserver = overrideObserver;
}
