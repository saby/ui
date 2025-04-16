/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Библиотека для работы с системой фокусов
 * @library
 * @module
 * @public
 */

export {
    // todo похоже используется только у нас и надо убрать с глаз
    ElementFinder,
    // todo что-то ненужное, используется в одном месте. возможно там надо как-то костыльнуть без апи.
    // https://git.sbis.ru/sbis/engine/-/blame/rc-25.1100/client/RichEditor/_base/TinyMCE.ts#L67
    nativeFocus,
    // todo это надо убрать из новой либы в какой-то вариант, который больше нельзя использовать но есть легаси
    goUpByControlTree,
    // todo непонятно зачем нужно если есть find и focus
    focusNextElement,
    findNextElement,
    focus,
    activate,
    FocusArea,
    FocusRoot,
    IFocusConfig,
    IFocusAreaProps,
    IFocusChangedConfig,
    TFocusChangedCallback,
} from 'UICore/Focus';
