import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';

let cachedViewport = {
    height: 0,
    width: 0,
};
let keyboardIsOpen = false;

function closeKeyboardOnTouchStart() {
    if (keyboardIsOpen) {
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
        height: window.visualViewport.height,
        width: window.visualViewport.width,
    };
}

// сохранили высоту вьюпорта при открытии страницы
export function enableMobileKeyboardDetection() {
    if (!ScrollOnBodyStore.read('enabled') || !window) {
        return;
    }
    saveViewportSizes();
    document.addEventListener('touchstart', closeKeyboardOnTouchStart);
    window.visualViewport.addEventListener('resize', detectKeyboardOpen);
}

export function disableMobileKeyboardDetection() {
    if (!ScrollOnBodyStore.read('enabled') || !window) {
        return;
    }
    document.removeEventListener('touchstart', closeKeyboardOnTouchStart);
    window.visualViewport.removeEventListener('resize', detectKeyboardOpen);
}
