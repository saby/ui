/**
 */
import { constants } from 'Env/Env';

/**
 * Отвечает на вопрос, нужно ли отслеживать обращения к полям после очистки.
 * @function UICore/_base/Control/Purifier#needLog
 * @returns { boolean }
 */
export default function needLog(): boolean {
    // Нужно отслеживать НЕ на бою.
    return !constants.isProduction;
}
