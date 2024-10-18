import type { IMouseEventInitExtend } from '../IEvents';

export function createFakeEvent(
    eventName: string,
    originEvent: TouchEvent,
    originTouch?: Touch
): IMouseEventInitExtend {
    return {
        type: eventName,
        bubbles: originEvent.bubbles,
        cancelable: originEvent.cancelable,
        view: window,
        detail: 1,
        screenX: originTouch.screenX,
        screenY: originTouch.screenY,
        clientX: originTouch.clientX,
        clientY: originTouch.clientY,
        ctrlKey: originEvent.ctrlKey,
        altKey: originEvent.altKey,
        shiftKey: originEvent.shiftKey,
        metaKey: originEvent.metaKey,
        button: 0,
        buttons: 0,
        relatedTarget: null,
        target: originEvent.target,
        currentTarget: originEvent.currentTarget,
        eventPhase: 1, // capture phase
        stopPropagation(): void {
            this.bubbles = false;
        },
        preventDefault(): void {
            // no action
        },
    };
}
