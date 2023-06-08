import { startRestoreFocus, stopRestoreFocus } from './restoreFocus';
import { startFocusEvents, stopFocusEvents } from './focusEvents';
import { tabDownController } from './tabDownController';

import { IDOMFocusConfig } from '../IFocus';

export function startDOMFocusSystem(
    rootElement: HTMLElement,
    {
        focusEvents = true,
        tabDown = true,
        restoreFocus = true,
    }: IDOMFocusConfig = {}
): void {
    if (tabDown) {
        tabDownController.addTabDownHandler(rootElement);
    }
    if (focusEvents) {
        startFocusEvents();
    }
    if (restoreFocus) {
        startRestoreFocus();
    }
}

export function stopDOMFocusSystem(
    rootElement: HTMLElement,
    {
        focusEvents = true,
        tabDown = true,
        restoreFocus = true,
    }: IDOMFocusConfig = {}
): void {
    if (tabDown) {
        tabDownController.removeTabDownHandler(rootElement);
    }
    if (focusEvents) {
        stopFocusEvents();
    }
    if (restoreFocus) {
        stopRestoreFocus();
    }
}
