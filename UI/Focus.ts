/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Библиотека фокусов
 * @library UI/Focus
 * @includes focusNextElement UICore/Focus:focusNextElement
 * @includes findNextElement UICore/Focus:findNextElement
 * @includes focus UICommon/Focus:focus
 * @includes activate UICommon/Focus:activate
 * @includes Activator UICore/Focus:Activator
 * @includes FocusArea UICore/Focus:FocusArea
 * @includes IFocusAreaProps UICore/Focus:IFocusAreaProps
 * @includes FocusRoot UICore/Focus:FocusRoot
 * @includes IFocusChangedConfig UICore/Focus:IFocusChangedConfig
 * @includes TFocusChangedCallback UICore/Focus:TFocusChangedCallback
 * @includes isRestoreFocusInProgress UICore/Focus:isRestoreFocusInProgress
 * @includes FocusEnvironment UICore/Focus:FocusEnvironment
 * @public
 */

export {
    // Временная ручка для переходного состояния нового скролла. Будет откат в 22.5000.
    enableHorizontalScrollOnTab,
    disableHorizontalScrollOnTab,
    ElementFinder,
    focusNextElement,
    findNextElement,
    focus,
    _FocusAttrs,
    nativeFocus,
    activate,
    Activator,
    FocusArea,
    IFocusAreaProps,
    FocusRoot,
    IFocusChangedConfig,
    TFocusChangedCallback,
    isRestoreFocusInProgress,
    FocusEnvironment,
    goUpByControlTree,
} from 'UICore/Focus';
