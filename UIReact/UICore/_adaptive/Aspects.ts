import { cookie, logger } from 'Application/Env';

export interface IAspects {
    windowInnerWidth?: number;
    windowInnerHeight?: number;
    windowOuterWidth?: number;
    windowOuterHeight?: number;
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
interface CookieValueOptions {
    path: string;
    expires: number;
}

const isClient = typeof window !== 'undefined';

export class Storage {
    private _cachedValue: IAspects;
    private _name: string = 'adaptiveAspects';
    private _commonCookieValueOptions: CookieValueOptions;
    private constructor() {
        // Чтобы кука даже на странице /page/page-name устанавливалась в корневой path.
        this._commonCookieValueOptions = {
            path: '/',
            expires: 365,
        };
    }

    private _setCookie(value: object = {}) {
        // Чистим старые значения cookie
        cookie.remove('adaptiveAspects');
        cookie.set(this._name, JSON.stringify(value), this._commonCookieValueOptions);
    }

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
            this._clear();
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
            this._setCookie(newValue);
        }
    }
    // только для юнитов
    _clear(): void {
        if (isClient) {
            this._cachedValue = {};
        }
        this._setCookie();
    }

    private static instance: Storage;

    static getInstance(): Storage {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }

        return Storage.instance;
    }
}
