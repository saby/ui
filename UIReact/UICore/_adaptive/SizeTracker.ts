import { DEFAULT_BREAKPOINTS } from './AdaptiveModeClass';

import { detection, constants } from 'Env/Env';
import { debounce } from 'Types/function';
import { Storage } from './Aspects';

function getSize(aspects: object, param: string): number {
    if (aspects?.[param]) {
        return aspects[param];
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.sm : DEFAULT_BREAKPOINTS.md;
    }
    return DEFAULT_BREAKPOINTS.lg;
}

export interface IWindowSizes {
    windowInnerWidth: number;
    windowInnerHeight: number;
}
export class WindowSizeTracker {
    private _cachedAspects: IWindowSizes;

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
                windowInnerWidth = getSize(aspects, 'windowInnerWidth');
                windowInnerHeight = getSize(aspects, 'windowInnerHeight');
                // если нужно пропустить recalculate style, попробуем вместо обращения к элементу взять значения из куки.
                // из элемента возьмем чуть позже, чтобы точно было актуальное значение.
                // Так мы отложим recalculate style, например при загрузке страницы, что критично.
                // Есть вероятность, что в куке будут неактуальные значения, тогда будет скачок верстки.
                setTimeout(() => {
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
            windowInnerWidth = getSize(aspects, 'windowInnerWidth');
            windowInnerHeight = getSize(aspects, 'windowInnerHeight');
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
            const trackBinded = this._track.bind(this, cb);
            window.addEventListener('resize', debounce(trackBinded, 200));
            return () => {
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
    containerScrollWidth: number;
    containerScrollHeight: number;
}
export class BodySizeTracker {
    private _cachedAspects: IBodySizes;

    private _getSize(aspects: object, param: string): number {
        if (aspects?.[param]) {
            return aspects[param];
        }

        if (detection.isMobilePlatform) {
            return detection.isPhone ? DEFAULT_BREAKPOINTS.sm : DEFAULT_BREAKPOINTS.md;
        }
        return DEFAULT_BREAKPOINTS.lg;
    }

    private _track(
        cb: (aspects: IBodySizes) => void,
        entries: unknown = undefined,
        resizeObserver: unknown = undefined,
        skipFirstRecalculate: boolean = false
    ) {
        const aspects = BodySizeTracker.getStorage().get();
        const hasAspects = !!(
            aspects?.hasOwnProperty('containerClientWidth') &&
            aspects?.hasOwnProperty('containerClientHeight') &&
            aspects?.hasOwnProperty('containerScrollWidth') &&
            aspects?.hasOwnProperty('containerScrollHeight')
        );
        let containerClientWidth;
        let containerClientHeight;
        let containerScrollWidth;
        let containerScrollHeight;

        if (constants.isBrowserPlatform) {
            if (skipFirstRecalculate && hasAspects) {
                containerClientWidth = this._getSize(aspects, 'containerClientWidth');
                containerClientHeight = this._getSize(aspects, 'containerClientHeight');
                containerScrollWidth = this._getSize(aspects, 'containerScrollWidth');
                containerScrollHeight = this._getSize(aspects, 'containerScrollHeight');
                // нужно пропустить recalculate style, попробуем вместо обращения к элементу взять значения из куки.
                // из элемента возьмем чуть позже, чтобы точно было актуальное значение.
                // Так мы отложим recalculate style, например при загрузке страницы, что критично.
                // Есть вероятность, что в куке будут неактуальные значения, тогда будет скачок верстки.
                setTimeout(() => {
                    this._track(cb);
                }, 1000);
            } else {
                containerClientWidth =
                    BodySizeTracker._$unit_containerClientWidth ?? document.body.clientWidth;
                containerClientHeight =
                    BodySizeTracker._$unit_containerClientHeight ?? document.body.clientHeight;
                containerScrollWidth =
                    BodySizeTracker._$unit_containerScrollWidth ?? document.body.scrollWidth;
                containerScrollHeight =
                    BodySizeTracker._$unit_containerScrollHeight ?? document.body.scrollHeight;
                BodySizeTracker.getStorage().set({
                    containerClientWidth,
                    containerClientHeight,
                    containerScrollWidth,
                    containerScrollHeight,
                });
            }
        } else {
            containerClientWidth = this._getSize(aspects, 'containerClientWidth');
            containerClientHeight = this._getSize(aspects, 'containerClientHeight');
            containerScrollWidth = this._getSize(aspects, 'containerScrollWidth');
            containerScrollHeight = this._getSize(aspects, 'containerScrollHeight');
        }

        if (
            !this._cachedAspects ||
            this._cachedAspects.containerClientWidth !== containerClientWidth ||
            this._cachedAspects.containerClientHeight !== containerClientHeight ||
            this._cachedAspects.containerScrollWidth !== containerScrollWidth ||
            this._cachedAspects.containerScrollHeight !== containerScrollHeight
        ) {
            this._cachedAspects = {
                containerClientWidth,
                containerClientHeight,
                containerScrollWidth,
                containerScrollHeight,
            };
        }

        cb(this._cachedAspects);
    }

    check(cb: (params: IBodySizes) => void, skipFirstRecalculate: boolean = false): () => void {
        this._track(cb, undefined, undefined, skipFirstRecalculate);

        if (constants.isBrowserPlatform && typeof ResizeObserver !== 'undefined') {
            const trackBinded = this._track.bind(this, cb);

            // create an Observer instance
            const resizeObserver = new ResizeObserver(debounce(trackBinded, 200));

            // start observing a DOM node
            resizeObserver.observe(document.body);
            return () => {
                resizeObserver.unobserve(document.body);
            };
        } else {
            return () => {};
        }
    }

    private static getStorage(): Storage {
        return BodySizeTracker._$storage ?? Storage.getInstance();
    }
    static _$storage: any;
    static _$unit_containerClientWidth: number;
    static _$unit_containerClientHeight: number;
    static _$unit_containerScrollWidth: number;
    static _$unit_containerScrollHeight: number;
}
