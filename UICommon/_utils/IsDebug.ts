import { cookie } from 'Env/Env';

let IS_DEBUG: boolean;
let s3debugCookie: string;

/**
 * Проверка, что в куке s3debug включен отладочный режим
 * false - если s3debug === 'false' или s3debug === <любое значение приводимое к false>
 * @hidden
 */
export function isDebug(): boolean {
    initCache();
    return IS_DEBUG;
}

/**
 * Получение значения куки s3debug
 * Значение кэшируется и при последующих запросах берется из кэша
 * @hidden
 */
export function gets3debug(): string {
    initCache();
    return s3debugCookie;
}

function initCache(): void {
    if (typeof window === 'undefined' || typeof IS_DEBUG === 'undefined') {
        s3debugCookie = cookie.get('s3debug');
        IS_DEBUG = s3debugCookie !== 'false' && !!s3debugCookie;
    }
}
