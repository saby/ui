/**
 */

import { IFocusAttributes, TFocusAttrName } from './IFocus';
import { Set } from 'Types/shim';

export const focusAttrList: TFocusAttrName[] = [
    'ws-creates-context',
    'ws-autofocus',
    'ws-tab-cycling',
    'tabindex',
    'tabIndex',
    'ws-delegates-tabfocus',
    'ws-no-focus',
];

const nativeAttrs: Set<TFocusAttrName> = new Set();
nativeAttrs.add('tabindex');
nativeAttrs.add('tabIndex');
nativeAttrs.add('ws-autofocus');

export function prepareAttrsForFocus(attributes: IFocusAttributes): void {
    if (!attributes || Object.isFrozen(attributes)) {
        return;
    }

    if (!attributes['ws-creates-context']) {
        attributes['ws-creates-context'] = 'true';
    }

    if (!attributes['ws-delegates-tabfocus']) {
        attributes['ws-delegates-tabfocus'] = 'true';
    }

    if (attributes.hasOwnProperty('ws-autofocus')) {
        attributes['ws-autofocus'] = '' + attributes['ws-autofocus'];
    }
}

// поправляет табиндекс для атрибутов, предназначенных для элемента, образующего контекст табиндексов
// табиндекс должен быть по умолчанию 0, табиндекса не может не быть вообще
export function prepareTabindex(attrs: IFocusAttributes): void {
    if (attrs['ws-creates-context'] === 'true') {
        if (!attrs.hasOwnProperty('tabindex')) {
            attrs.tabindex = '0';
        }
    }
}

/**
 * Применяет к DOM контейнеру конфиг. Должен вызываться из рефа.
 * @param container контейнер
 * @param cfg применяемые атрибуты
 */
export function configureContainer(
    container: HTMLElement,
    cfg: IFocusAttributes
): void {
    const attrObj: IFocusAttributes = {};
    for (let i = 0; i < focusAttrList.length; i++) {
        const attrName = focusAttrList[i];
        const attrValue = cfg[attrName];
        if (attrValue) {
            attrObj[attrName] = '' + attrValue;
        }
    }

    for (let i = 0; i < focusAttrList.length; i++) {
        const attrName = focusAttrList[i];
        const attrValue = attrObj[attrName];
        // Нативные атрибуты устанавливаются пропсами
        if (!nativeAttrs.has(attrName)) {
            container[attrName] = attrValue;
        }
    }

    // В реалиях чистого реакта слишком рано присваивать tabindex 0 в подготовке атрибутов.
    // Кто-то может попытаться поставить другой tabindex на контент после этого, а не получится. Перенесём эту логику в ref.
    if (
        attrObj['ws-creates-context'] === 'true' &&
        container.getAttribute('tabindex') === null
    ) {
        container.tabIndex = 0;
    }
}

// Атрибуты системы фокусов (кроме табиндекса) не нужно вешать на элемент.
// Поэтому вырежем их из оригинального конфига, и вернём то что вырезали для передачи в реф.
export function extractFocusAttributes(
    cfg: IFocusAttributes
): IFocusAttributes {
    const extractedAttributes: IFocusAttributes = {};
    for (let i = 0; i < focusAttrList.length; i++) {
        const attrName = focusAttrList[i];
        if (nativeAttrs.has(attrName)) {
            // Нативные атрибуты устанавливаются пропсами
            continue;
        }
        if (cfg.hasOwnProperty(attrName)) {
            extractedAttributes[attrName] = cfg[attrName];
            delete cfg[attrName];
        }
    }
    return extractedAttributes;
}

const EMPTY_FOCUS_ATTRS = {};
prepareAttrsForFocus(EMPTY_FOCUS_ATTRS);
Object.freeze(EMPTY_FOCUS_ATTRS);

/**
 * Функция создания атрибутов по умолчаню для раектовских компонентов
 * @FIXME https://online.sbis.ru/opendoc.html?guid=54b690c1-6d94-480b-8aab-d022319591b9&client=3
 */
export function returnSingletonFocusAttrs(): Record<string, string> {
    return EMPTY_FOCUS_ATTRS;
}

/**
 * По умолчанию ли это атрибуты для фокусов или нет.
 * @FIXME https://online.sbis.ru/opendoc.html?guid=54b690c1-6d94-480b-8aab-d022319591b9&client=3
 */
export function isSingletonFocusAttrs(attrs: unknown): boolean {
    return attrs === EMPTY_FOCUS_ATTRS;
}
