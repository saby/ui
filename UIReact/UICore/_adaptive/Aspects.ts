import { cookie, logger } from 'Application/Env';

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

const isClient = typeof window !== 'undefined';

// Чтобы кука даже на странице /page/page-name устанавливалась в корневой path.
const commonCookieValueOptions = { path: '/' };

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
                `Невалидное значение куки ${this._name}. ` +
                'Если поменяли её вручную, следует исправить или удалить. ' +
                `Текущее значение: ${cookieStr}`;
            logger.error(message);
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

    private static instance: Storage;

    static getInstance(): Storage {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }

        return Storage.instance;
    }
}
