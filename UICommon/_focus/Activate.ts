/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Модуль, в котором находится логика по активации контролов
 */

import {
    getElementProps,
    findFirstInContext,
    findWithContexts,
} from './ElementFinder';
import { focus } from './Focus';

import { IFocusConfig } from './IFocus';

import { isElementVisible } from 'UICommon/Utils';

import {
    isContainerWithOldControl,
    trySetActiveControlOnElement,
    activateClosestAreaAbstractCompatible,
} from 'Core/FocusCompatible';

function findAutofocusForVDOM(
    findContainer: HTMLElement
): NodeListOf<HTMLElement> {
    return findContainer.querySelectorAll('[ws-autofocus="true"]');
}

function doFocus(container: HTMLElement, cfg: IFocusConfig = {}): boolean {
    if (container === document.activeElement) {
        return true;
    }
    if (isContainerWithOldControl(container)) {
        const oldActivateResult = trySetActiveControlOnElement(container);
        return !!oldActivateResult?.isActive;
    }
    if (getElementProps(container).tabStop) {
        if (focus(container, cfg)) {
            // поддерживаем совместимость. нужно отстрелять старые события чтобы область в WindowManager стала
            // последней активной, чтобы потом на нее восстанавливался фокус если он будет восстанавливаться
            // по старому механизму
            activateClosestAreaAbstractCompatible(container);
            return true;
        }
    }
    return false;
}

/**
 * @public
 * @description Поиск подходящего для фокусировки элемента и перевод фокуса на него
 * @param {HTMLElement} [container] - контейнер для активации
 * @param {IFocusConfig} [cfg]
 * @returns {boolean} удалось ли найти и сфокусировать элемент
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/activate-control/
 */
export function activate(
    container: HTMLElement,
    cfg: IFocusConfig = {
        enableScreenKeyboard: false,
        enableScrollToElement: false,
    }
): boolean {
    // сначала попробуем поискать по ws-autofocus, если найдем - позовем focus рекурсивно для найденного компонента
    const autofocusElems = findAutofocusForVDOM(container);
    let autofocusElem: HTMLElement;

    for (let i = 0; i < autofocusElems.length; i++) {
        autofocusElem = autofocusElems[i];

        // Если на элементе указать ws-autofocus="true" и tabindex="-1", то такой элемент не будет участвовать в активации.
        if (autofocusElem.getAttribute('tabindex') === '-1') {
            continue;
        }

        // При переходе на реакт разрешили вешать ws-autofocus на любой контейнер, чтобы не получать экземпляр контрола.
        if (!isContainerWithOldControl(autofocusElem)) {
            return activate(autofocusElem, cfg);
        }

        const oldActivateResult = trySetActiveControlOnElement(autofocusElem);
        if (!oldActivateResult) {
            continue;
        }
        return oldActivateResult.isActive;
    }

    // если не получилось найти по автофокусу, поищем первый элемент по табиндексам и сфокусируем его.
    // причем если это будет конейнер старого компонента, активируем его по старому тоже
    // так ищем DOMEnvironment для текущего компонента. В нем сосредоточен код по работе с фокусами.
    let next = findFirstInContext(container, false);
    if (next) {
        // при поиске первого элемента игнорируем vdom-focus-in и vdom-focus-out
        const startElem = 'vdom-focus-in';
        const finishElem = 'vdom-focus-out';
        if (next.classList.contains(startElem)) {
            next = findWithContexts(container, next, false);
        }
        if (next.classList.contains(finishElem)) {
            next = null;
        }
    }
    if (next) {
        return doFocus(next, cfg);
    }
    if (isElementVisible(container)) {
        return doFocus(container, cfg);
    }

    return false;
}
