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

interface IWindowSizes {
    windowInnerWidth: number;
    windowInnerHeight: number;
}
export class WindowSizeTracker {
    private _cachedAspects: IWindowSizes;
    private timeoutId: number;

    private _track(cb: (aspects: IWindowSizes) => void) {
        const aspects = WindowSizeTracker.getStorage().get();
        let windowInnerWidth;
        let windowInnerHeight;

        if (constants.isBrowserPlatform) {
            // вычислить из куки избежав recalculate style не получится, могут быть ошибки
            // могут зайти на другую страницу с другими размерами и возьмется неправильное значение
            windowInnerWidth = WindowSizeTracker._$unit_width ?? window.innerWidth;
            windowInnerHeight = WindowSizeTracker._$unit_height ?? window.innerHeight;
            WindowSizeTracker.getStorage().set({
                windowInnerWidth,
                windowInnerHeight,
            });
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

    check(cb: (params: IWindowSizes) => void): () => void {
        this._track(cb);

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

interface IBodySizes {
    containerClientWidth: number;
    containerClientHeight: number;
}
class BodySizeTracker {
    private _cachedAspects: IBodySizes;
    private timeoutId: number;

    private _track(cb: (aspects: IBodySizes) => void) {
        const aspects = BodySizeTracker.getStorage().get();
        let containerClientWidth;
        let containerClientHeight;

        if (constants.isBrowserPlatform) {
            // вычислить из куки избежав recalculate style не получится, могут быть ошибки
            // могут зайти на другую страницу с другими размерами и возьмется неправильное значение
            containerClientWidth =
                BodySizeTracker._$unit_containerClientWidth ?? document.body.clientWidth;
            containerClientHeight =
                BodySizeTracker._$unit_containerClientHeight ?? document.body.clientHeight;
            BodySizeTracker.getStorage().set({
                containerClientWidth,
                containerClientHeight,
            });
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

    check(cb: (params: IBodySizes) => void): () => void {
        this._track(cb);

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

export interface ISizes extends IWindowSizes, IBodySizes {}
export class SizeTracker {
    private windowSizeTracker: WindowSizeTracker = new WindowSizeTracker();
    private bodySizeTracker: BodySizeTracker = new BodySizeTracker();

    check(callback: (params: ISizes) => void): () => void {
        const callbackDebounced = debounce(callback, 10);
        let _windowSizes: IWindowSizes;
        let _bodySizes: IBodySizes;
        const stopWindowSizeChecking = this.windowSizeTracker.check((windowSizes) => {
            _windowSizes = windowSizes;
            callbackDebounced({
                ..._windowSizes,
                ..._bodySizes,
            });
        });
        const stopBodySizeChecking = this.bodySizeTracker.check((bodySizes) => {
            _bodySizes = bodySizes;
            callbackDebounced({
                ..._windowSizes,
                ..._bodySizes,
            });
        });
        callback({
            ..._windowSizes,
            ..._bodySizes,
        });
        return () => {
            stopWindowSizeChecking();
            stopBodySizeChecking();
        };
    }
}
