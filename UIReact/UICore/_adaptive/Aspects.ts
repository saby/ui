import { cookie } from 'Application/Env';

export interface IAspects {
    windowInnerWidth?: number;
    windowInnerHeight?: number;
    containerClientWidth?: number;
    containerClientHeight?: number;
    containerScrollWidth?: number;
    containerScrollHeight?: number;

    isTouch?: boolean;
    // если задано то форсируется
    isVertical?: boolean;
    // если задано то форсируется
    isPhone?: boolean;
    // если задано то форсируется
    isTablet?: boolean;
}

export class Storage {
    private _cachedValue: IAspects;
    private _name: string = 'adaptiveAspects';
    private constructor() {}

    get(): IAspects {
        if (typeof window !== 'undefined' && this._cachedValue) {
            return this._cachedValue;
        }
        const cookieStr = cookie.get(this._name);
        return cookieStr ? JSON.parse(cookieStr) : {};
    }
    set(value: IAspects) {
        const oldValue = this.get();
        let newValue;
        let changed = false;
        for (const p in value) {
            if (value[p] !== oldValue[p]) {
                newValue = newValue || {
                    ...oldValue,
                };
                newValue[p] = value[p];
                changed = true;
            }
        }
        if (changed) {
            if (typeof window !== 'undefined') {
                // на сервере кэш будет один, и будет пересекаться с другими запросами и страницами, будет путаница
                this._cachedValue = newValue;
            }
            cookie.set(this._name, JSON.stringify(newValue));
        }
    }

    private static instance: Storage;

    static getInstance(): Storage {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }

        return Storage.instance;
    }
}
