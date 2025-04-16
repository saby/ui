import { updateBodyScroll } from './ScrollOnBody';
import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';

let originalScrollEnabledState: boolean;

function hideScrollBar(): void {
    document.documentElement.classList.add('hideNativeScrollBar');
}

function restoreScrollBar(): void {
    document.documentElement.classList.remove('hideNativeScrollBar');
}

function handleBeforePrint(): void {
    originalScrollEnabledState = ScrollOnBodyStore.read('enabled');

    hideScrollBar();

    ScrollOnBodyStore.write('enabled', true);
    updateBodyScroll();
}

function handleAfterPrint(): void {
    restoreScrollBar();

    if (originalScrollEnabledState !== undefined) {
        ScrollOnBodyStore.write('enabled', originalScrollEnabledState);
        updateBodyScroll();
    }
}

export function addPrintHandlers(): void {
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
}

export function removePrintHandlers(): void {
    window.removeEventListener('beforeprint', handleBeforePrint);
    window.removeEventListener('afterprint', handleAfterPrint);
    restoreScrollBar();
}
