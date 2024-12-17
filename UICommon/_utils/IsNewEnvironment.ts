import { isInit } from 'Application/Initializer';
import { getStore } from 'Application/Env';

/**
 * Модуль возвращает функцию, которая позволяет выполнить проверку: построена ли текущая страница
 * на основе {@link Controls/Application}.
 *
 * <h2>Возвращает</h2>
 *
 * <ul>
 *     <li>true, если веб-страница создана на основе компонента Controls/Application.</li>
 *     <li>false, во всех остальных случаях.</li>
 * </ul>
 * @class UICommon/_utils/IsNewEnvironment
 * @public
 */

/**
 * проверка на наличие настоящего HeadDataStore
 * createDefaultStore возвращает undefined, чтобы не создавать FakeWebStorage
 * https://online.sbis.ru/opendoc.html?guid=a5ad92bb-14e7-400a-a004-30e3af45bf75
 */
export default function isNewEnvironment() {
    if (isInit()) {
        const headData = getStore<Record<string, boolean>>('HeadData');
        const _isNewEnvironment = headData && headData.get('isNewEnvironment');

        // только при заданном значении false возвращаем false. иначе всегда true
        return _isNewEnvironment !== false;
    }
    return false;
}
