/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { TEnableScroll } from './_ResetScrolling';

export interface IFocusConfig {
    enableScreenKeyboard?: boolean;
    enableScrollToElement?: TEnableScroll;
}

export interface IFocusAttributes {
    'ws-creates-context'?: string;
    'ws-delegates-tabfocus'?: string;
    'ws-autofocus'?: string;
    'ws-no-focus'?: string;
    'ws-tab-cycling'?: string;
    tabindex?: string;
    tabIndex?: string;
}

/**
 * @interface UICommon/_focus/IKeyPressedData
 * @public
 * @description Информация о событии {@link https://developer.mozilla.org/ru/docs/Web/API/KeyboardEvent нажатия клавиши клавиатуры}.
 */
/**
 * @name UICommon/_focus/IKeyPressedData#key
 * @cfg {string}
 */
/**
 * @name UICommon/_focus/IKeyPressedData#target
 * @cfg {EventTarget}
 */
/**
 * @name UICommon/_focus/IKeyPressedData#shiftKey
 * @cfg {boolean}
 */
/**
 * @name UICommon/_focus/IKeyPressedData#ctrlKey
 * @cfg {boolean}
 */
/**
 * @name UICommon/_focus/IKeyPressedData#altKey
 * @cfg {boolean}
 */
export interface IKeyPressedData {
    key: KeyboardEvent['key'];
    target: KeyboardEvent['target'];
    shiftKey: KeyboardEvent['shiftKey'];
    ctrlKey: KeyboardEvent['ctrlKey'];
    altKey: KeyboardEvent['altKey'];
}

export type TFocusAttrName = keyof IFocusAttributes;

export interface IFocusElementProps {
    enabled: boolean;
    tabStop: boolean;
    createsContext: boolean;
    tabIndex: number;
    delegateFocusToChildren: boolean;
    tabCycling: boolean;
}

export type TPropsGetter = (element: HTMLElement, tabbable?: boolean) => IFocusElementProps;

export interface IMatchesElement extends Element {
    matchesSelector?: typeof Element.prototype.matches;
    msMatchesSelector?: typeof Element.prototype.matches;
    mozMatchesSelector?: typeof Element.prototype.matches;
    oMatchesSelector?: typeof Element.prototype.matches;
}

export interface IIEElement extends Element {
    setActive: () => void;
}
