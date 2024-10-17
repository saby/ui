import { getResourceUrl as requireGetResourceUrl } from 'RequireJsLoader/conduct';
import { detection } from 'Env/Env';
import { gets3debug } from './IsDebug';
import 'i18n!controller?';
import { controller } from 'I18n/i18n';

/**
 * Возвращает обработанный URL ресураса с указанием домена и версии.
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>url</b> {String} - URL для обработки.</li>
 *     <li><b>skipDebug</b> {Boolean} - Использовать ли cookie s3debug для обработки URL ресурса (например для гифок нет смысла и может мешать в гидрации).</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {String} обработанный URL.
 * @class UICommon/_utils/getResourceUrl
 * @public
 */
export default function getResourceUrl(
    url: string,
    skipDebug: boolean = false
): string {
    const s3debug = skipDebug ? 'false' : gets3debug();
    return requireGetResourceUrl(
        url,
        s3debug,
        false,
        detection.isIE,
        controller.currentLocaleConfig.directionality,
        true
    );
}
