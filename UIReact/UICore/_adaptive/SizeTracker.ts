/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { DEFAULT_BREAKPOINTS } from './AdaptiveModeClass';

import { detection, constants } from 'Env/Env';
import { debounce } from 'Types/function';
import { Storage } from './Aspects';

function getWidth(aspects: object, param: string): number {
    if (aspects?.[param]) {
        return aspects[param];
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.xs : DEFAULT_BREAKPOINTS.sm;
    }
    return DEFAULT_BREAKPOINTS.md;
}
function getHeight(aspects: object, param: string): number {
    if (aspects?.[param]) {
        return aspects[param];
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.sm : DEFAULT_BREAKPOINTS.md;
    }
    return DEFAULT_BREAKPOINTS.lg;
}

interface IWindowSizes {
    windowInnerWidth: number;
    windowInnerHeight: number;
    windowOuterWidth: number;
    windowOuterHeight: number;
    viewportWidth: number;
    viewportHeight: number;
}
export class WindowSizeTracker {
    private _cachedAspects: IWindowSizes;
    private timeoutId: number;

    private _track(cb: (aspects: IWindowSizes) => void) {
        const aspects = WindowSizeTracker.getStorage().get();
        let windowInnerWidth;
        let windowInnerHeight;
        let windowOuterWidth;
        let windowOuterHeight;
        let viewportWidth;
        let viewportHeight;

        if (constants.isBrowserPlatform) {
            // вычислить из куки избежав recalculate style не получится, могут быть ошибки
            // могут зайти на другую страницу с другими размерами и возьмется неправильное значение
            windowInnerWidth = WindowSizeTracker._$unit_width ?? window.innerWidth;
            windowInnerHeight = WindowSizeTracker._$unit_height ?? window.innerHeight;
            windowOuterWidth = WindowSizeTracker._$unit_width ?? window.outerWidth;
            windowOuterHeight = WindowSizeTracker._$unit_height ?? window.outerHeight;
            viewportWidth = WindowSizeTracker._$unit_width ?? window.visualViewport?.width ?? 0;
            viewportHeight = WindowSizeTracker._$unit_height ?? window.visualViewport?.height ?? 0;
            WindowSizeTracker.getStorage().set({
                windowInnerWidth,
                windowInnerHeight,
                windowOuterWidth,
                windowOuterHeight,
                viewportWidth,
                viewportHeight,
            });
        } else {
            windowInnerWidth = getWidth(aspects, 'windowInnerWidth');
            windowInnerHeight = getHeight(aspects, 'windowInnerHeight');
            windowOuterWidth = getWidth(aspects, 'windowOuterWidth');
            windowOuterHeight = getHeight(aspects, 'windowOuterHeight');
            viewportWidth = getWidth(aspects, 'viewportWidth');
            viewportHeight = getHeight(aspects, 'viewportHeight');
        }

        if (
            !this._cachedAspects ||
            this._cachedAspects.windowInnerWidth !== windowInnerWidth ||
            this._cachedAspects.windowInnerHeight !== windowInnerHeight ||
            this._cachedAspects.windowOuterWidth !== windowOuterWidth ||
            this._cachedAspects.windowOuterHeight !== windowOuterHeight ||
            this._cachedAspects.viewportWidth !== viewportWidth ||
            this._cachedAspects.viewportHeight !== viewportHeight
        ) {
            this._cachedAspects = {
                windowInnerWidth,
                windowInnerHeight,
                windowOuterWidth,
                windowOuterHeight,
                viewportWidth,
                viewportHeight,
            };
        }

        cb(this._cachedAspects);
    }

    check(cb: (params: IWindowSizes) => void): () => void {
        this._track(cb);

        // При инициализации приложения в фрейме проставляются размеры фрейма, а не страницы
        if (constants.isBrowserPlatform && !window.frameElement) {
            const trackBinded = this._track.bind(this, cb);
            const trackDebounced = debounce(this._track.bind(this, cb), 200);
            window.addEventListener('resize', trackDebounced);
            // Навешиваем обработчик на window, чтобы при перезагрузке кука обновлялась.
            window.addEventListener('beforeunload', trackBinded);
            return () => {
                clearTimeout(this.timeoutId);
                window.removeEventListener('resize', trackDebounced);
                window.removeEventListener('beforeunload', trackBinded);
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
            const bodyStyles = getComputedStyle(document.body);
            const top = parseInt(bodyStyles.getPropertyValue('padding-top'), 10) || 0;
            const bottom = parseInt(bodyStyles.getPropertyValue('padding-bottom'), 10) || 0;
            const left = parseInt(bodyStyles.getPropertyValue('padding-left'), 10) || 0;
            const right = parseInt(bodyStyles.getPropertyValue('padding-right'), 10) || 0;
            containerClientWidth = document.body.clientWidth - left - right;
            containerClientHeight = document.body.clientHeight - top - bottom;

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
