/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Библиотека фокусов
 * @library UICommon/Focus
 * @includes IKeyPressedData UICommon/_focus/IKeyPressedData
 * @public
 */

import * as ElementFinder from './_focus/ElementFinder';
import { focus, _initFocus, nativeFocus, nativeFocusEvents } from './_focus/Focus';
import { activate } from './_focus/Activate';
export { preventFocus, hasNoFocus } from './_focus/PreventFocus';

import {
    IFocusConfig,
    IFocusAttributes,
    IFocusElementProps,
    TPropsGetter,
    IKeyPressedData,
} from './_focus/IFocus';

import * as FocusAttrs from './_focus/FocusAttrs';
import { TEnableScroll } from './_focus/_ResetScrolling';

export {
    ElementFinder,
    focus,
    _initFocus,
    FocusAttrs as _FocusAttrs,
    IFocusConfig,
    IFocusAttributes,
    IFocusElementProps,
    TPropsGetter,
    IKeyPressedData,
    TEnableScroll,
    nativeFocus,
    nativeFocusEvents,
    activate,
};