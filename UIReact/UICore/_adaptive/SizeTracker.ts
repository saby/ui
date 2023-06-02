import { DEFAULT_BREAKPOINTS } from './AdaptiveModeClass';
import { IAspects } from './Aspects';

import { cookie } from 'Application/Env';
import { detection, constants } from 'Env/Env';

export interface ISize {
    width: number;
    height: number;
}
export interface IStorage {
    get(): ISize;
    set(aspects: ISize): void;
}
class Storage {
    private _cachedSize: ISize;

    constructor(size: ISize = undefined) {
        if (size) {
            this.set(size);
        }
    }
    get(): ISize {
        if (this._cachedSize) {
            return this._cachedSize;
        }
        const cookieStr = cookie.get('adaptiveSize');
        return cookieStr ? JSON.parse(cookieStr) : {};
    }
    set(size: ISize) {
        this._cachedSize = size;
        cookie.set('adaptiveSize', JSON.stringify(size));
    }
}

export class SizeTracker {
    private _storage: IStorage;
    private _cachedAspects: IAspects;
    static _$unit_width: number;
    static _$unit_height: number;

    constructor(
        storage: IStorage = new Storage()
    ) {
        this._storage = storage;
    }

    private _getSize(param: string): number {
        const aspects = this._storage.get();
        if (aspects?.[param]) {
            return aspects[param];
        }

        if (detection.isMobilePlatform) {
            return detection.isPhone
                ? DEFAULT_BREAKPOINTS.sm
                : DEFAULT_BREAKPOINTS.md;
        }
        return DEFAULT_BREAKPOINTS.lg;
    }

    private _track(cb: (aspects: IAspects) => void) {
        if (constants.isBrowserPlatform) {
            this._storage.set({
                width: SizeTracker._$unit_width ?? document.body.clientWidth,
                height: SizeTracker._$unit_height ?? document.body.clientHeight,
            });
        }

        const width = this._getSize('width');
        const height = this._getSize('height');

        if (
            !this._cachedAspects ||
            this._cachedAspects.width !== width ||
            this._cachedAspects.height !== height
        ) {
            this._cachedAspects = {
                width, height
            };
        }

        cb(this._cachedAspects);
    }

    check(cb: (params: IAspects) => void): () => void {
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

export function createSizeTracker(
    storage: IStorage = new Storage()
) {
    return new SizeTracker(storage);
}
