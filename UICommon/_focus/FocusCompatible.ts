/* eslint-disable */
// @ts-nocheck
/**
 * Модуль совместимости системы фокусов
 * Библиотека UI/Focus ничего не должна знать про API старых контролов.
 * @author Кондаков Р.Н.
 */

import { getClosestControl } from 'UICommon/NodeCollector';
import type * as Control from 'Lib/Control/Control';
import type * as AreaAbstractCompatible from 'Lib/Control/AreaAbstract/AreaAbstract.compatible';

interface IElementWithControl {
    wsControl?: Control;
}

/**
 *  Проверка, есть ли на элементе старый контрол.
 */
export function isContainerWithOldControl(element: HTMLElement): boolean {
    return !!(element as IElementWithControl)?.wsControl?.setActive;
}

/**
 *  Проверка, есть ли на элементе старый контрол, который может принять фокус.
 */
export function canAcceptFocusControlOnElement(element: HTMLElement): boolean {
    return !!(element as IElementWithControl)?.wsControl?.canAcceptFocus();
}

/**
 * Попытка активировать ws3 контрол на элементе.
 * Если на элементе есть ws3 контрол, который можно попытаться сфокусировать, возвращает результат его активации
 * Иначе возвращает null
 */
export function trySetActiveControlOnElement(element: HTMLElement): null | { isActive: boolean } {
    if (!isContainerWithOldControl(element)) {
        return null;
    }
    if (!canAcceptFocusControlOnElement(element)) {
        return null;
    }
    const control: Control = (element as IElementWithControl).wsControl;
    control.setActive(true);
    return {
        isActive: !!control.isActive(),
    };
}

/**
 * Активация ближайшего к элементу ws2 контрола.
 */
export function activateClosestAreaAbstractCompatible(element: HTMLElement): void {
    const closestParentControl = getClosestControl(element);
    if (closestParentControl && '_activate' in closestParentControl) {
        (closestParentControl as AreaAbstractCompatible)._activate(closestParentControl);
    }
}
