import { Storage, getWidth, getHeight } from './Aspects';

export interface IWindowSizes {
    windowInnerWidth: number;
    windowInnerHeight: number;
    windowOuterWidth: number;
    windowOuterHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    screenWidth: number;
    screenHeight: number;
}

const nop = () => {};

abstract class WindowSizeTrackerAbstract {
    abstract check(_cb: (params: IWindowSizes) => void, tracker: boolean): () => void;
    static _$storage: any;
    static _$unit_width: number;
    static _$unit_height: number;
}

class WindowSizeTrackerClient extends WindowSizeTrackerAbstract {
    private domElementWithSizes: HTMLElement;
    private _cachedAspects: IWindowSizes;
    constructor(domElementWithSizes?: HTMLElement) {
        super();
        this.domElementWithSizes = domElementWithSizes || document.body;
    }
    private _track(cb: (aspects: IWindowSizes) => void) {
        const windowInnerWidth = WindowSizeTrackerClient._$unit_width ?? window.innerWidth;
        const windowInnerHeight = WindowSizeTrackerClient._$unit_height ?? window.innerHeight;
        const windowOuterWidth = WindowSizeTrackerClient._$unit_width ?? window.outerWidth;
        const windowOuterHeight = WindowSizeTrackerClient._$unit_height ?? window.outerHeight;
        const viewportWidth =
            WindowSizeTrackerClient._$unit_width ?? window.visualViewport?.width ?? 0;
        const viewportHeight =
            WindowSizeTrackerClient._$unit_height ?? window.visualViewport?.height ?? 0;
        const screenWidth = WindowSizeTrackerClient._$unit_width ?? window.screen?.width ?? 0;
        const screenHeight = WindowSizeTrackerClient._$unit_height ?? window.screen?.height ?? 0;

        if (this.domElementWithSizes === document.body) {
            // сохраняем только для SizeTracker зарегистрированного для document.body,
            // остальные зовутся с AdaptiveInitializer которые не должны писать в куку ничего,
            // это могут быть AdaptiveInitializer добавленные в createControl для совместимости,
            // или вообще построения adaptieveMode из fromJSON, это все не должно влиять на куку.
            // Кука обновляется только для одного трекера, зарегистрированного для корневого AdaptiveInitializer,
            // а у него передается элемент body в качестве отслеживаемого
            WindowSizeTrackerClient.getStorage().set({
                windowInnerWidth,
                windowInnerHeight,
                windowOuterWidth,
                windowOuterHeight,
                viewportWidth,
                viewportHeight,
                screenWidth,
                screenHeight,
            });
        }

        if (
            !this._cachedAspects ||
            this._cachedAspects.windowInnerWidth !== windowInnerWidth ||
            this._cachedAspects.windowInnerHeight !== windowInnerHeight ||
            this._cachedAspects.windowOuterWidth !== windowOuterWidth ||
            this._cachedAspects.windowOuterHeight !== windowOuterHeight ||
            this._cachedAspects.viewportWidth !== viewportWidth ||
            this._cachedAspects.viewportHeight !== viewportHeight ||
            this._cachedAspects.screenWidth !== screenWidth ||
            this._cachedAspects.screenHeight !== screenHeight
        ) {
            this._cachedAspects = {
                windowInnerWidth,
                windowInnerHeight,
                windowOuterWidth,
                windowOuterHeight,
                viewportWidth,
                viewportHeight,
                screenWidth,
                screenHeight,
            };
        }

        cb(this._cachedAspects);
    }
    check(cb: (params: IWindowSizes) => void, tracker: boolean): () => void {
        this._track(cb);

        // При инициализации приложения в фрейме проставляются размеры фрейма, а не страницы
        if (window.frameElement) {
            return nop;
        }
        if (!tracker) {
            return nop;
        }
        const trackBinded = this._track.bind(this, cb);
        const trackDebounced = this._track.bind(this, cb);
        window.addEventListener('resize', trackDebounced);
        // Навешиваем обработчик на window, чтобы при перезагрузке кука обновлялась.
        window.addEventListener('beforeunload', trackBinded);
        return () => {
            window.removeEventListener('resize', trackDebounced);
            window.removeEventListener('beforeunload', trackBinded);
        };
    }
    private static getStorage(): Storage {
        return WindowSizeTrackerClient._$storage ?? Storage.getInstance();
    }
}

class WindowSizeTrackerServer extends WindowSizeTrackerAbstract {
    private _track(cb: (aspects: IWindowSizes) => void) {
        const aspects = WindowSizeTrackerServer.getStorage().get();
        const windowInnerWidth = getWidth(aspects, 'windowInnerWidth');
        const windowInnerHeight = getHeight(aspects, 'windowInnerHeight');
        const windowOuterWidth = getWidth(aspects, 'windowOuterWidth');
        const windowOuterHeight = getHeight(aspects, 'windowOuterHeight');
        const viewportWidth = getWidth(aspects, 'viewportWidth');
        const viewportHeight = getHeight(aspects, 'viewportHeight');
        const screenWidth = getWidth(aspects, 'screenWidth');
        const screenHeight = getHeight(aspects, 'screenHeight');
        cb({
            windowInnerWidth,
            windowInnerHeight,
            windowOuterWidth,
            windowOuterHeight,
            viewportWidth,
            viewportHeight,
            screenWidth,
            screenHeight,
        });
    }
    check(cb: (params: IWindowSizes) => void, _tracker: boolean): () => void {
        this._track(cb);
        return nop;
    }
    private static getStorage(): Storage {
        return WindowSizeTrackerServer._$storage ?? Storage.getInstance();
    }
}

export const WindowSizeTracker =
    typeof window === 'undefined' ? WindowSizeTrackerServer : WindowSizeTrackerClient;
export type WindowSizeTracker = WindowSizeTrackerServer | WindowSizeTrackerClient;
