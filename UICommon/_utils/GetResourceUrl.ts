import { getResourceUrl as requireGetResourceUrl } from 'RequireJsLoader/conduct';
import { cookie, detection } from 'Env/Env';

/**
 * Возвращает обработанный URL ресураса с указанием домена и версии.
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>url</b> {String} - URL для обработки.</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {String} обработанный URL.
 * @class UICommon/_utils/getResourceUrl
 * @public
 * @author Мальцев А.А.
 */
export default function getResourceUrl(url: string): string {
    return requireGetResourceUrl(url, cookie.get('s3debug'), false, detection.isIE);
}
