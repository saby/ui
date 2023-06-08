/**
 * Библиотека фокусов
 * @library UI/Focus
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
    goUpByControlTree,
    DefaultOpenerFinder,
} from 'UICore/Focus';
