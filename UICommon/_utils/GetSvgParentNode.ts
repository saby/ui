import { detection } from 'Env/Env';

/**
 * Модуль, в котором описана функция <b>getSvgParentNode(elem)</b>.
 *
 * Метод выполняет в IE для переданного элемента и находит родителя для SVG элемента:
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>elem</b> элемент для нахождения родителя</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {EventTarget} Элемент.
 *
 * @class UICommon/_utils/GetSvgParentNode
 * @public
 */

type TIEEventTarget = EventTarget & { correspondingUseElement?: SVGUseElement };

export default function getSvgParentNode(element: EventTarget): EventTarget {
    if (!detection.isIE) {
        return element;
    }
    // IE.
    let result = element as TIEEventTarget;
    while (result && result.correspondingUseElement) {
        result = result.correspondingUseElement.parentNode as TIEEventTarget;
    }
    return result;
}
