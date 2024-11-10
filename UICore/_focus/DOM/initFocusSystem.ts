/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
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
