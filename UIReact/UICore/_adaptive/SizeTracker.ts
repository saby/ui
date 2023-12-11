import { DEFAULT_BREAKPOINTS } from './AdaptiveModeClass';

import { detection, constants } from 'Env/Env';
import { debounce } from 'Types/function';
import { Storage } from './Aspects';

function getWidth(aspects: object, param: string): number {
    if (aspects?.[param]) {
        return aspects[param];
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.sm : DEFAULT_BREAKPOINTS.md;
    }
    return DEFAULT_BREAKPOINTS.lg;
}
function getHeight(aspects: object, param: string): number {
    if (aspects?.[param]) {
        return aspects[param];
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.xs : DEFAULT_BREAKPOINTS.sm;
    }
    return DEFAULT_BREAKPOINTS.md;
}

export interface IWindowSizes {
    windowInnerWidth: number;
    windowInnerHeight: number;
}
export class WindowSizeTracker {
    private _cachedAspects: IWindowSizes;
    private timeoutId: number;

    private _track(
        cb: (aspects: IWindowSizes) => void,
        event: unknown = undefined,
        skipFirstRecalculate: boolean = false
    ) {
        const aspects = WindowSizeTracker.getStorage().get();
        const hasAspects = !!(
            aspects?.hasOwnProperty('windowInnerWidth') &&
            aspects?.hasOwnProperty('windowInnerHeight')
        );
        let windowInnerWidth;
        let windowInnerHeight;

        if (constants.isBrowserPlatform) {
            if (skipFirstRecalculate && hasAspects) {
                windowInnerWidth = getWidth(aspects, 'windowInnerWidth');
                windowInnerHeight = getHeight(aspects, 'windowInnerHeight');
                // если нужно пропустить recalculate style, попробуем вместо обращения к элементу взять значения из куки.
                // из элемента возьмем чуть позже, чтобы точно было актуальное значение.
                // Так мы отложим recalculate style, например при загрузке страницы, что критично.
                // Есть вероятность, что в куке будут неактуальные значения, тогда будет скачок верстки.
                this.timeoutId = setTimeout(() => {
                    this._track(cb);
                }, 1000);
            } else {
                windowInnerWidth = WindowSizeTracker._$unit_width ?? window.innerWidth;
                windowInnerHeight = WindowSizeTracker._$unit_height ?? window.innerHeight;
                WindowSizeTracker.getStorage().set({
                    windowInnerWidth,
                    windowInnerHeight,
                });
            }
        } else {
            windowInnerWidth = getWidth(aspects, 'windowInnerWidth');
            windowInnerHeight = getHeight(aspects, 'windowInnerHeight');
        }

        if (
            !this._cachedAspects ||
            this._cachedAspects.windowInnerWidth !== windowInnerWidth ||
            this._cachedAspects.windowInnerHeight !== windowInnerHeight
        ) {
            this._cachedAspects = {
                windowInnerWidth,
                windowInnerHeight,
            };
        }

        cb(this._cachedAspects);
    }

    check(cb: (params: IWindowSizes) => void, skipFirstRecalculate: boolean = false): () => void {
        this._track(cb, undefined, skipFirstRecalculate);

        if (constants.isBrowserPlatform) {
            const trackBinded = debounce(this._track.bind(this, cb), 200);
            window.addEventListener('resize', trackBinded);
            return () => {
                clearTimeout(this.timeoutId);
                return window.removeEventListener('resize', trackBinded);
            };
        } else {
            return () => {};
        }
    }

    private static getStorage(): Storage {
        return WindowSizeTracker._$storage ?? Storage.getInstance();
    }
    static _$storage: any;
    static _$unit_width: number;
    static _$unit_height: number;
}

export interface IBodySizes {
    containerClientWidth: number;
    containerClientHeight: number;
}
export class BodySizeTracker {
    private _cachedAspects: IBodySizes;
    private timeoutId: number;

    private _track(
        cb: (aspects: IBodySizes) => void,
        entries: unknown = undefined,
        resizeObserver: unknown = undefined,
        skipFirstRecalculate: boolean = false
    ) {
        const aspects = BodySizeTracker.getStorage().get();
        const hasAspects = !!(
            aspects?.hasOwnProperty('containerClientWidth') &&
            aspects?.hasOwnProperty('containerClientHeight')
        );
        let containerClientWidth;
        let containerClientHeight;

        if (constants.isBrowserPlatform) {
            if (skipFirstRecalculate && hasAspects) {
                containerClientWidth = getWidth(aspects, 'containerClientWidth');
                containerClientHeight = getHeight(aspects, 'containerClientHeight');
                // нужно пропустить recalculate style, попробуем вместо обращения к элементу взять значения из куки.
                // из элемента возьмем чуть позже, чтобы точно было актуальное значение.
                // Так мы отложим recalculate style, например при загрузке страницы, что критично.
                // Есть вероятность, что в куке будут неактуальные значения, тогда будет скачок верстки.
                this.timeoutId = setTimeout(() => {
                    this._track(cb);
                }, 1000);
            } else {
                containerClientWidth =
                    BodySizeTracker._$unit_containerClientWidth ?? document.body.clientWidth;
                containerClientHeight =
                    BodySizeTracker._$unit_containerClientHeight ?? document.body.clientHeight;
                BodySizeTracker.getStorage().set({
                    containerClientWidth,
                    containerClientHeight,
                });
            }
        } else {
            containerClientWidth = getWidth(aspects, 'containerClientWidth');
            containerClientHeight = getHeight(aspects, 'containerClientHeight');
        }

        if (
            !this._cachedAspects ||
            this._cachedAspects.containerClientWidth !== containerClientWidth ||
            this._cachedAspects.containerClientHeight !== containerClientHeight
        ) {
            this._cachedAspects = {
                containerClientWidth,
                containerClientHeight,
            };
        }

        cb(this._cachedAspects);
    }

    check(cb: (params: IBodySizes) => void, skipFirstRecalculate: boolean = false): () => void {
        this._track(cb, undefined, undefined, skipFirstRecalculate);

        if (constants.isBrowserPlatform && typeof ResizeObserver !== 'undefined') {
            const trackBinded = debounce(this._track.bind(this, cb), 200);

            // create an Observer instance
            const resizeObserver = new ResizeObserver(trackBinded);

            // start observing a DOM node
            resizeObserver.observe(document.body);
            return () => {
                clearTimeout(this.timeoutId);
                resizeObserver.unobserve(document.body);
            };
        } else {
            return () => {
                clearTimeout(this.timeoutId);
            };
        }
    }

    private static getStorage(): Storage {
        return BodySizeTracker._$storage ?? Storage.getInstance();
    }
    static _$storage: any;
    static _$unit_containerClientWidth: number;
    static _$unit_containerClientHeight: number;
}
