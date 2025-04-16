/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { detection } from 'Env/Env';

let originalIntersectionObserver: typeof IntersectionObserver;
let overrideObserver: typeof IntersectionObserver;
let isScrollOnBody = false;

export function initIntersectionObserver(): void {
    if (
        typeof IntersectionObserver === 'undefined' ||
        (overrideObserver && IntersectionObserver instanceof overrideObserver)
    ) {
        return;
    }
    originalIntersectionObserver = IntersectionObserver;
    overrideObserver = function (
        callback: IntersectionObserverCallback,
        options: IntersectionObserverInit
    ): IntersectionObserver {
        // следим за body если пересечение подписали на скролл контейнер
        // TODO: тут проверять фичу не получится, т.к. вызывает зацикливаение кода во время билда
        if (detection.isPhone && isScrollOnBody) {
            if (
                options.root &&
                (options.root as Element).scrollHeight >
                    (window.visualViewport as VisualViewport).height
            ) {
                options.root = null;
            }
            options.rootMargin = options.rootMargin || '30% 0% 30% 0%';
            options.threshold = options.threshold || 0;
        }
        const overrideCallback = (
            entries: IntersectionObserverEntry[],
            observer: IntersectionObserver
        ): void => {
            return callback(entries, observer);
        };
        return new (originalIntersectionObserver.prototype
            .constructor as typeof IntersectionObserver)(overrideCallback, options);
    } as unknown as typeof IntersectionObserver;
    overrideObserver.prototype = originalIntersectionObserver.prototype;
    IntersectionObserver = overrideObserver;
}

export function setScrollOnBody(value: boolean): void {
    isScrollOnBody = value;
}
