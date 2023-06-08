import {
    AdaptiveModeClass,
    AdaptiveModeType,
    ScreensType,
    DEFAULT_BREAKPOINTS,
    STANDARD_DESKTOP_WIDTH,
    STANDARD_PHONE_WIDTH,
    STANDARD_TABLET_WIDTH,
} from './AdaptiveModeClass';
import { cookie } from 'Application/Env';
import { detection, constants } from 'Env/Env';

export type CreatorReturnType = {
    checkBreakpoint(cb: (adaptiveMode: AdaptiveModeType) => void): () => void;
};

interface IAspects {
    width: number;
}
export interface IStorage {
    get(): IAspects;
    set(aspects: IAspects): void;
}
class Storage {
    private _cachedAspects: IAspects;

    constructor(aspects: IAspects = undefined) {
        if (aspects) {
            this.set(aspects);
        }
    }
    get(): IAspects {
        if (this._cachedAspects) {
            return this._cachedAspects;
        }
        const cookieStr = cookie.get('adaptiveAspects');
        return cookieStr ? JSON.parse(cookieStr) : {};
    }
    set(aspects: IAspects) {
        this._cachedAspects = aspects;
        cookie.set('adaptiveAspects', JSON.stringify(aspects));
    }
}

class AdaptiveModeCreator {
    private _screensSorted: [string, number][];
    private _screens: ScreensType;
    private _adaptiveMode: AdaptiveModeType;
    private _matchedBreakpoint: string;
    private _storage: IStorage;

    constructor(
        screens: ScreensType = DEFAULT_BREAKPOINTS,
        storage: IStorage = new Storage()
    ) {
        this._screens = screens;
        this._storage = storage;

        this._screensSorted = Object.entries(screens).sort(
            (
                [k1, v1]: [string, number],
                [k2, v2]: [string, number]
            ): number => {
                if (v1 === v2) return 0;
                return v1 > v2 ? 1 : -1;
            }
        );
    }

    private _getCurrentMatchedBreakpoint(currentWidth: number): string {
        if (!currentWidth) {
            return undefined;
        }
        const minWidth = this._screensSorted[0][1];
        const maxWidth = this._screensSorted[this._screensSorted.length - 1][1];
        if (currentWidth < minWidth) {
            // значение есть, но оно меньше самого маленького брейкпойнта и у него нет названия
            return '';
        }
        if (currentWidth >= maxWidth) {
            return this._screensSorted[this._screensSorted.length - 1][0];
        }

        let found;
        this._screensSorted.forEach(([key, value], index) => {
            if (currentWidth >= value) {
                found = index;
            }
        });
        return this._screensSorted[found][0];
    }

    private _getWidth(): number {
        const aspects = this._storage.get();
        if (aspects?.width) {
            return aspects.width;
        }

        if (detection.isMobilePlatform) {
            return detection.isPhone
                ? STANDARD_PHONE_WIDTH
                : STANDARD_TABLET_WIDTH;
        }
        return STANDARD_DESKTOP_WIDTH;
    }

    private _track(cb: (adaptiveMode: AdaptiveModeType) => void) {
        if (constants.isBrowserPlatform) {
            this._storage.set({
                width: window.innerWidth,
            });
        }

        const prevMatchedBreakpoint = this._matchedBreakpoint;

        const width = this._getWidth();
        this._matchedBreakpoint = this._getCurrentMatchedBreakpoint(width);

        // если нужно инициализировать или обновить
        if (
            !this._adaptiveMode ||
            prevMatchedBreakpoint !== this._matchedBreakpoint
        ) {
            this._adaptiveMode = new AdaptiveModeClass(
                this._screens,
                this._matchedBreakpoint
            );
        }
        cb(this._adaptiveMode);
    }

    checkBreakpoint(cb: (adaptiveMode: AdaptiveModeType) => void): () => void {
        this._track(cb);

        if (constants.isBrowserPlatform) {
            const trackBinded = this._track.bind(this, cb);
            window.addEventListener('resize', trackBinded);
            return () => {
                return window.removeEventListener('resize', trackBinded);
            };
        } else {
            return () => {};
        }
    }
}

export function create(
    screens: ScreensType = DEFAULT_BREAKPOINTS,
    storage: IStorage = new Storage()
) {
    return new AdaptiveModeCreator(screens, storage);
}
