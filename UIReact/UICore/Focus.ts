/**
 * Библиотека фокусов
 * @library UICore/Focus
 * @includes focusNextElement UICore/_focus/DOM/focusNextElement
 * @includes CreateFocusCallbacksRef UICore/_focus/Component/CreateFocusCallbacksRef
 * @includes useFocusCallbacks UICore/_focus/Component/useFocusCallbacks
 * @includes DefaultOpenerFinder UICore/_focus/Component/DefaultOpenerFinder
 * @includes IFocusChangedConfig UICore/_focus/IFocusChangedConfig
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

export {
    startDOMFocusSystem,
    stopDOMFocusSystem,
} from './_focus/DOM/initFocusSystem';
export {
    focusNextElement,
    findNextElement,
} from './_focus/DOM/focusNextElement';
export {
    IFocusChangedConfig,
    IFocusCallbacksObject,
} from './_focus/Component/IFocusComponent';
export { CreateFocusCallbacksRef } from './_focus/Component/CreateFocusCallbacksRef';
export { useFocusCallbacks } from './_focus/Component/useFocusCallbacks';
export { isRestoreFocusInProgress } from './_focus/DOM/restoreFocus';

// Временная ручка для переходного состояния нового скролла. Будет откат в 22.5000.
export {
    enableHorizontalScrollOnTab,
    disableHorizontalScrollOnTab,
} from './_focus/DOM/tabDownController';

export { goUpByControlTree } from 'UICore/NodeCollector';

export { default as DefaultOpenerFinder } from './_focus/Component/DefaultOpenerFinder';
