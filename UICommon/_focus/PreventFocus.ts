/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { getSvgParentNode } from 'UICommon/Utils';
import { IFocusHTMLElement } from './IFocus';

/**
 * Содержит логику по предотвращению фокуса по клику
 */

export function hasNoFocus(
    element: Element & { correspondingUseElement?: SVGUseElement }
): boolean {
    const html = document.documentElement;
    let currentElement = getSvgParentNode(element) as IFocusHTMLElement;
    while (currentElement && currentElement !== html) {
        // todo совместимость! когда уберем совместимость, надо убрать element.getAttribute('ws-no-focus')
        if (currentElement['ws-no-focus'] || currentElement.getAttribute('ws-no-focus')) {
            return true;
        }
        // Используем parentNode, вместо parentElement, потому что в ie у svg-элементов, нет свойства parentElement
        currentElement = currentElement.parentNode as IFocusHTMLElement;
    }
    return false;
}

export function preventFocus(event: MouseEvent): void {
    if (hasNoFocus(event.target as Element)) {
        event.preventDefault();
    }
}
