import {detection} from 'Env/Env';
import { getSvgParentNode } from 'UICommon/Utils';

/**
 * @author Кондаков Р.Н.
 * Содержит логику по предотвращению фокуса по клику
 */

export function hasNoFocus(element: Element & {correspondingUseElement?: SVGUseElement}): boolean {
   const html = document.documentElement;
   let currentElement = getSvgParentNode(element);
   while (currentElement !== html) {
      // todo совместимость! когда уберем совместимость, надо убрать element.getAttribute('ws-no-focus')
      if (currentElement['ws-no-focus'] || currentElement.getAttribute('ws-no-focus')) {
         return true;
      }
      // Используем parentNode, вместо parentElement, потому что в ie у svg-элементов, нет свойства parentElement
      currentElement = currentElement.parentNode as Element;
   }
   return false;
}
export function preventFocus(event: MouseEvent): void {
   if (hasNoFocus(event.target as Element)) {
      event.preventDefault();
   }
}
