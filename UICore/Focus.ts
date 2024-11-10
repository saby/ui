/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Библиотека фокусов
 * @library UICore/Focus
 * @includes IFocusRootProps UICore/_focus/IFocusRootProps
 * @public
 */
export {
    ElementFinder,
    focus,
    _initFocus,
    _FocusAttrs,
    IFocusConfig,
    IFocusAttributes,
    IFocusElementProps,
    TPropsGetter,
    nativeFocus,
    preventFocus,
    hasNoFocus,
    activate,
} from 'UICommon/Focus';

export { startDOMFocusSystem, stopDOMFocusSystem } from './_focus/DOM/initFocusSystem';
export { focusNextElement, findNextElement } from './_focus/DOM/focusNextElement';
export {
    IFocusChangedConfig,
    IFocusCallbacksObject,
    TFocusChangedCallback,
} from './_focus/Component/IFocusComponent';
export { isRestoreFocusInProgress } from './_focus/DOM/restoreFocus';
export { Activator } from './_focus/DOM/Activator';

export { default as FocusArea, IFocusAreaProps } from './_focus/Component/FocusArea';
export { default as FocusEnvironment } from './_focus/Component/FocusEnvironment';
export { default as FocusRoot } from './_focus/Component/FocusRoot';

// Временная ручка для переходного состояния нового скролла. Будет откат в 22.5000.
export {
    enableHorizontalScrollOnTab,
    disableHorizontalScrollOnTab,
} from './_focus/DOM/tabDownController';

export { goUpByControlTree } from 'UICore/NodeCollector';

export { default as DefaultOpenerFinder } from './_focus/Component/DefaultOpenerFinder';
