import { ElementFinder, focus, IFocusConfig } from 'UICommon/Focus';
import { trySetActiveControlOnElement } from 'Core/FocusCompatible';

/**
 * Функционал перевода фокуса как при нажатии на Tab.
 * @param {boolean} [findBackward=false] - Искать ли элемент в обратном порядке, как при нажатии Shift+Tab
 * @param {HTMLElement} [relativeElement=document.activeElement] - Элемент, относительно которого ищется элемент для фокусировки.
 * @param {IFocusConfig} config - Конфиг фокусировки.
 * @returns {boolean} - Удалось ли найти и сфокусировать элемент.
 * @example
 * <pre class="brush: js">
 *  import { focusNextElement } from 'UI/Focus';
 *
 *  // перевести фокус как при нажатии Tab.
 *  focusNextElement();
 *
 *  // перевести фокус как при нажатии Shift+Tab.
 *  focusNextElement(true);
 * </pre>
 */
export function focusNextElement(
    findBackward: boolean = false,
    relativeElement: HTMLElement = document.activeElement as HTMLElement,
    config?: IFocusConfig
): boolean {
    const nextElement = findNextElement(findBackward, relativeElement);
    if (!nextElement) {
        return false;
    }

    const oldActivateResult = trySetActiveControlOnElement(nextElement);
    if (oldActivateResult) {
        return oldActivateResult.isActive;
    }

    focus(nextElement, config);
    return true;
}

/**
 * Функционал поиска элемента, который бы сфокусировался при нажатии на Tab. Найденный элемент не фокусируется автоматически.
 * @param {boolean} [findBackward=false] - Искать ли элемент в обратном порядке, как при нажатии Shift+Tab
 * @param {HTMLElement} [relativeElement=document.activeElement] - Элемент, относительно которого ищется элемент для фокусировки.
 * @returns {HTMLElement} - результат поиска.
 * @example
 * <pre class="brush: js">
 *  import { findNextElement, focus } from 'UI/Focus';
 *
 *  let elementToFocus: HTMLElement = findNextElement();
 *
 *  // Нужно пропустить элемент с определённым id.
 *  if (elementToFocus.id === 'badElement') {
 *      elementToFocus = findNextElement();
 *  }
 *
 *  focus(elementToFocus);
 *
 * </pre>
 */
export function findNextElement(
    findBackward: boolean = false,
    relativeElement: HTMLElement = document.activeElement as HTMLElement
): HTMLElement {
    let rootElement: HTMLElement = relativeElement;
    while (
        rootElement.tagName !== 'BODY' &&
        rootElement['ws-tab-cycling'] !== 'true'
    ) {
        // Похоже на костыль,
        // потому что система фокусов и так не должна при поиске элемента подниматься выше ws-tab-cycling.
        rootElement = rootElement.parentNode as HTMLElement;
    }
    return ElementFinder.findWithContexts(
        rootElement,
        relativeElement,
        findBackward
    );
}
