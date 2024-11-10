/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';

let cachedViewport = {
    height: 0,
    width: 0,
};
let keyboardIsOpen = false;
const DONT_CLOSE_TAG = ['INPUT', 'TEXTAREA'];

function closeKeyboardOnTouchStart() {
    if (keyboardIsOpen && !DONT_CLOSE_TAG.includes(document.activeElement.tagName)) {
        document.activeElement.blur();
        keyboardIsOpen = false;
    }
}

function detectKeyboardOpen() {
    const _visualViewport = window.visualViewport;
    // перевернули телефон
    if (_visualViewport.width !== cachedViewport.width) {
        saveViewportSizes();
        return;
    }
    if (_visualViewport.height < cachedViewport.height) {
        keyboardIsOpen = true;
    }
}

function saveViewportSizes() {
    cachedViewport = {
        height: window.visualViewport?.height,
        width: window.visualViewport?.width,
    };
}

/**
 * Включение механизма определения мобильной клавиатуры
 * функция сохраняет высоту вьюпорта при открытии страницы
 */
export function enableMobileKeyboardDetection() {
    if (!ScrollOnBodyStore.read('enabled') || !window) {
        return;
    }
    saveViewportSizes();
    document.addEventListener('touchstart', closeKeyboardOnTouchStart);
    window.visualViewport?.addEventListener('resize', detectKeyboardOpen);
}
/**
 * Выключение механизма определения мобильной клавиатуры
 */
export function disableMobileKeyboardDetection() {
    if (!ScrollOnBodyStore.read('enabled') || !window) {
        return;
    }
    document.removeEventListener('touchstart', closeKeyboardOnTouchStart);
    window.visualViewport?.removeEventListener('resize', detectKeyboardOpen);
}
