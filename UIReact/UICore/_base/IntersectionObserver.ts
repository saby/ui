// import { detection } from 'Env/Env';
// import { Feature } from 'Feature/feature';

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
    overrideObserver = function (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
    ): IntersectionObserver {
        // следим за body если пересечение подписали на скролл контейнер
        // TODO: тут проверять фичу не получится, т.к. вызывает зацикливаение кода во время билда
        // if (detection.isMobilePlatform && Feature.requireLocal(['scrollOnBody'])[0].isOn()) {
        //     if (options.root && options.root.scrollHeight > window.visualViewport.height) {
        //         options.root = null;
        //     }
        //     options.rootMargin = options.rootMargin || '30% 0% 30% 0%';
        //     options.threshold = options.threshold || 0;
        // }
        const overrideCallback = (
            entries: IntersectionObserverEntry[],
            observer: IntersectionObserver
        ): void => {
            return callback(entries, observer);
        };
        return new originalIntersectionObserver.prototype.constructor(overrideCallback, options);
    };
    overrideObserver.prototype = originalIntersectionObserver.prototype;
    IntersectionObserver = overrideObserver;
}
