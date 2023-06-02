import { detection } from 'Env/Env';

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
    overrideObserver = function(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
    ): IntersectionObserver {
        // следим за body если пересечение подписали на скролл контейнер
        if (detection.isMobilePlatform && options?.root?.className.includes('controls-Scroll-Container')) {
            options.root = null;
            options.rootMargin = '0% 0% 30% 0%';
            options.threshold = 0;
        }
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
