import { getConfig } from 'Application/Env';
import { isInit } from 'Application/Initializer';

let unitTestMode: boolean;

/**
 * Проверка, что режим работы под unit-тестом.
 * Чтобы получить конфиг, нужен живой Application.
 * @private
 */
export function isUnitTestMode(): boolean {
    if (!isInit()) {
        return false;
    }

    if (typeof unitTestMode === 'undefined') {
        unitTestMode = !!getConfig('unitTestMode');
    }

    return unitTestMode;
}
