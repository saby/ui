import { cookie, logger } from 'Application/Env';

export interface IAspects {
    windowInnerWidth?: number;
    windowInnerHeight?: number;
    containerClientWidth?: number;
    containerClientHeight?: number;

    isTouch?: boolean;
    // если задано то форсируется
    isVertical?: boolean;
    // если задано то форсируется
    isPhone?: boolean;
    // если задано то форсируется
    isTablet?: boolean;
}

const isClient = typeof window !== 'undefined';

// Чтобы кука даже на странице /page/page-name устанавливалась в корневой path.
const commonCookieValueOptions = { path: '/', expires: 365 };

export class Storage {
    private _cachedValue: IAspects;
    private _name: string = 'adaptiveAspects';
    private constructor() {}

    get(): IAspects {
        if (isClient && this._cachedValue) {
            return this._cachedValue;
        }
        const cookieStr = cookie.get(this._name);
        let cookieObj: IAspects;
        try {
            cookieObj = cookieStr ? JSON.parse(cookieStr) : {};
        } catch (e) {
            const message =
                `Обнаружено невалидное значение куки ${this._name}. ` +
                'Убедительная просьба не менять эту куку самостоятельно. ' +
                `Текущее значение "${cookieStr}" будет заменено на дефолтное.`;
            logger.error(message);
            cookie.set(this._name, '{}', commonCookieValueOptions);
            cookieObj = {};
        }
        if (isClient) {
            this._cachedValue = cookieObj;
        }
        return cookieObj;
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
            if (isClient) {
                // на сервере кэш будет один, и будет пересекаться с другими запросами и страницами, будет путаница
                this._cachedValue = newValue;
            }
            cookie.set(this._name, JSON.stringify(newValue), commonCookieValueOptions);
        }
    }
    clear(): void {
        if (isClient) {
            this._cachedValue = {};
        }
        cookie.set(this._name, '{}', commonCookieValueOptions);
    }

    private static instance: Storage;

    static getInstance(): Storage {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }

        return Storage.instance;
    }
}
