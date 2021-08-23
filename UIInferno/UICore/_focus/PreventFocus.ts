import {detection} from 'Env/Env';

/**
 * @author Кондаков Р.Н.
 * Содержит логику по предотвращению фокуса по клику
 */

export function hasNoFocus(element: Element & {correspondingUseElement?: SVGUseElement}): boolean {
   const html = document.documentElement;
   let currentElement = element;
   while (currentElement !== html) {
      // todo совместимость! когда уберем совместимость, надо убрать element.getAttribute('ws-no-focus')
      // в ie у svg элементов нет getAttribute, надо делать проверку на наличие метода
      if (currentElement['ws-no-focus'] ||
          (currentElement.getAttribute && currentElement.getAttribute('ws-no-focus'))) {
         return true;
      }
      // Используем parentNode, вместо parentElement, потому что в ie у svg-элементов, нет свойства parentElement
      if (detection.isIE && currentElement.correspondingUseElement) {
         currentElement = currentElement.correspondingUseElement.parentNode as Element;
         continue;
      }
      currentElement = currentElement.parentNode as Element;
   }
   return false;
}
export function preventFocus(event: MouseEvent): void {
   if (hasNoFocus(event.target as Element)) {
      event.preventDefault();
   }
}
