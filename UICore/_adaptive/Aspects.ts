/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { isNewEnvironment } from 'UICommon/Utils';
import { cookie } from 'Application/Env';
import { detection } from 'Env/Env';

/**
 * Набор значений брейкпойнтов по умолчанию.
 * Используется как набор констант, которые удобно использовать в API adaptiveContainer
 * @example
 * <pre>
 * function InnerControl() {
 *   	const adaptiveMode = useAdaptiveMode();
 * 	  const innerWidth = adaptiveMode.window.innerWidth;
 *
 * 	  if (innerWidth.up(DEFAULT_BREAKPOINTS.md)) {
 *    		return 'mode is 768px or upper';
 * 	  }
 * 	  return 'mode is less than 768px';
 * }
 * </pre>
 */
export const DEFAULT_BREAKPOINTS = Object.freeze({
    xs: 375,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
});

export interface IWidthAspects {
    windowInnerWidth?: number;
    windowOuterWidth?: number;
    viewportWidth?: number;
    screenWidth?: number;
    containerClientWidth?: number;
}

export interface IHeightAspects {
    windowInnerHeight?: number;
    windowOuterHeight?: number;
    viewportHeight?: number;
    screenHeight?: number;
    containerClientHeight?: number;
}

export interface IAspects extends IWidthAspects, IHeightAspects {
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

export function getWidth(aspects: IAspects | undefined, param: keyof IWidthAspects): number {
    const widthFromAspects = aspects?.[param];
    if (widthFromAspects) {
        return widthFromAspects;
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.xs + 1 : DEFAULT_BREAKPOINTS.sm + 1;
    }
    return DEFAULT_BREAKPOINTS.lg + 1;
}

export function getHeight(aspects: IAspects | undefined, param: keyof IHeightAspects): number {
    const heightFromAspects = aspects?.[param];
    if (heightFromAspects) {
        return heightFromAspects;
    }

    if (detection.isMobilePlatform) {
        return detection.isPhone ? DEFAULT_BREAKPOINTS.sm + 1 : DEFAULT_BREAKPOINTS.md + 1;
    }
    return DEFAULT_BREAKPOINTS.md + 1;
}

const SIZE_ASPECTS: (keyof IWidthAspects | keyof IHeightAspects)[] = [
    'windowInnerWidth',
    'windowInnerHeight',
    'windowOuterWidth',
    'windowOuterHeight',
    'viewportWidth',
    'viewportHeight',
    'screenWidth',
    'screenHeight',
    'containerClientWidth',
    'containerClientHeight',
];

const isClient = typeof window !== 'undefined';
const cookieName = 's3ac';
const SEPARATOR = '!';
const FLAG_NUMBER = 4;

function bitArrayToInt(value: boolean[]): number {
    // eslint-disable-next-line no-bitwise
    return value.reduce((res, x) => (res << 1) | (x ? 1 : 0), 0);
}
function intToBitArray(value: number): boolean[] {
    const result = value ? [] : [false];

    while (value) {
        // eslint-disable-next-line no-bitwise
        result.unshift((value & 1) === 1);
        // eslint-disable-next-line no-bitwise
        value >>= 1;
    }
    while (result.length < FLAG_NUMBER) {
        result.unshift(false);
    }
    return result;
}
function stringify(value: IAspects): string {
    return (
        // @ts-ignore
        SIZE_ASPECTS.reduce((res, x) => res + (value[x] || '') + SEPARATOR, '') +
        bitArrayToInt([
            value.isTouch ?? false, // 8
            value.isVertical ?? false, // 4
            value.isPhone ?? false, // 2
            value.isTablet ?? false, // 1
        ])
    );
}
function parse(value: string): IAspects {
    const parsed = value.split(SEPARATOR);
    if (parsed.length !== SIZE_ASPECTS.length + 1) {
        throw new Error();
    }
    const res: IAspects = {};
    for (let i = 0; i < SIZE_ASPECTS.length; i++) {
        const name = SIZE_ASPECTS[i];
        if (parsed[i] === '') {
            res[name] = undefined;
        } else {
            res[name] = Number.parseFloat(parsed[i]);
            if (Number.isNaN(res[name])) {
                throw new Error();
            }
        }
    }

    const flagsNumber = Number.parseInt(parsed[SIZE_ASPECTS.length], 10);
    if (Number.isNaN(flagsNumber)) {
        throw new Error();
    }
    const flags = intToBitArray(flagsNumber);
    res.isTouch = flags[0]; // 8
    res.isVertical = flags[1]; // 4
    res.isPhone = flags[2]; // 2
    res.isTablet = flags[3]; // 1
    return res;
}

function isIFrame() {
    // window.frameElement не работает, надо так
    // https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
    return window.self !== window.top;
}

export class Storage {
    private _cachedValue: IAspects | undefined;
    private _commonCookieValueOptions: CookieValueOptions;
    private constructor() {
        // Чтобы кука даже на странице /page/page-name устанавливалась в корневой path.
        this._commonCookieValueOptions = {
            path: '/',
            expires: 365,
        };
    }

    private _setCookie(value: IAspects) {
        if (cookie.get('adaptiveAspects')) {
            // удаляем старое название куки, переименовали на s3aa как более короткое
            // в будущем планируем вообще отказаться от куки как способа хранить значения
            cookie.remove('adaptiveAspects');
        }
        if (cookie.get('s3aa')) {
            cookie.remove('s3aa');
        }
        if (cookie.get('s3ab')) {
            cookie.remove('s3ab');
        }
        const valueStr = stringify(value);
        if (cookie.get(cookieName) !== valueStr) {
            // Чистим старое значение cookie, были проблемы с правильным определением path откуда читать куку
            // и очистка помогла https://online.sbis.ru/opendoc.html?guid=f43a221c-39de-41ef-ad27-75ea4f33a428&client=3
            cookie.remove(cookieName);
            cookie.set(cookieName, valueStr, this._commonCookieValueOptions);
        }
    }

    get(): IAspects {
        if (isClient && this._cachedValue) {
            return this._cachedValue;
        }
        const cookieStr = cookie.get(cookieName);
        let cookieObj: IAspects;
        try {
            cookieObj = cookieStr ? parse(cookieStr) : {};
        } catch (e) {
            // const message =
            //     `Обнаружено невалидное значение куки ${cookieName}. ` +
            //     'Убедительная просьба не менять эту куку самостоятельно. ' +
            //     `Текущее значение "${cookieStr}" будет заменено на дефолтное.`;
            // logger.error(message);
            const defaultValue = {};
            if (isClient) {
                this._cachedValue = defaultValue;
            }
            this._setCookie(defaultValue);
            cookieObj = defaultValue;
        }
        if (isClient) {
            // todo можно и на сервере закэшить через getStore?
            this._cachedValue = cookieObj;
        }
        return cookieObj;
    }
    set(value: IAspects) {
        if (!isClient) {
            // не обновляем вообще на сервере, там нет новых данных для обновления, только читаем
            return;
        }
        if (isIFrame()) {
            // не обновляем для фреймов
            // При инициализации приложения во фрейме проставляются размеры фрейма, а не страницы
            return;
        }
        if (!isNewEnvironment()) {
            // Если старое окружение, не поддерживаем актуализацию данных куки с таких страниц.
            // Там createControl вызываются непонятно для каких элементов и более 1 раза
            // createControl должен вызывать 1 раз и на всех страницах для одного и того же элемента,
            // чтобы кука указывала именно на его размеры (containerClientWidth, containerClientHeight)
            return;
        }
        const oldValue = this.get();
        const newValue: IAspects = {
            ...oldValue,
            ...value,
        };
        let changed = false;
        const valueKeys = Object.keys(value) as (keyof IAspects)[];
        for (const p of valueKeys) {
            if (value[p] !== oldValue[p]) {
                changed = true;
            }
        }
        if (changed) {
            // для чтения на клиенте - так быстрее
            this._cachedValue = newValue;
            // для чтения на сервере
            this._setCookie(newValue);
        }
    }
    // метод оставляем публичным только для юнитов
    _clear(): void {
        if (isClient) {
            this._cachedValue = undefined;
        }
        this._setCookie({});
    }

    private static instance: Storage;

    static getInstance(): Storage {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }

        return Storage.instance;
    }
}
