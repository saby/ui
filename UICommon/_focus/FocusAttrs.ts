/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
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

interface IFocusProps {
    tabIndex?: number | string;
    cycling?: 'true' | 'false';
    autofocus?: 'true' | 'false';
    unclickable?: boolean;
}

const fromFocusAttrsToAreaPropsMap: Record<TFocusAttrName, keyof IFocusProps | undefined> = {
    'ws-no-focus': 'unclickable',
    'ws-creates-context': undefined,
    'ws-delegates-tabfocus': undefined,
    'ws-autofocus': 'autofocus',
    'ws-tab-cycling': 'cycling',
    tabindex: 'tabIndex',
    tabIndex: 'tabIndex',
};

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

export function extractAttributesForFocusArea(cfg: IFocusAttributes): IFocusProps {
    const extractedAttributes: Record<string, string> = {};
    for (let i = 0; i < focusAttrList.length; i++) {
        const attrName = focusAttrList[i];
        if (!cfg.hasOwnProperty(attrName)) {
            continue;
        }
        const newKey = fromFocusAttrsToAreaPropsMap[attrName];
        const value = cfg[attrName];
        if (newKey && value) {
            extractedAttributes[newKey] = value;
        }
        delete cfg[attrName];
    }
    return extractedAttributes;
}

const focusRootAttributes: (keyof IFocusAttributes)[] = [
    'ws-creates-context',
    'ws-delegates-tabfocus',
    'ws-tab-cycling',
    'ws-no-focus',
    'ws-autofocus',
];

export function hasFocusRootAttributes(cfg: IFocusAttributes): boolean {
    for (const attributeToFocusRootFlag of focusRootAttributes) {
        if (cfg[attributeToFocusRootFlag] !== undefined) {
            return true;
        }
    }
    return false;
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
