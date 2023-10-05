import {
    IEventState,
    ITouchEvent,
    ILongTapEvent,
    WasabyTouchEvent,
    createEventDetails,
} from './TouchEvents';

import { LONG_TAP_MIN_DURATION, LONG_TAP_THRESHOLD } from './TouchConstants';
/**
 */

let longTapState;
let handlerName;

export class LongTapController {
    private static tapTimeout;

    static checkThreshold(event: ITouchEvent) {
        const location = WasabyTouchEvent.getTouchLocation(event);
        if (!longTapState.location) {
            this.resetState();
            return;
        }
        if (
            Math.abs(longTapState.location.x - location.x) < LONG_TAP_THRESHOLD &&
            Math.abs(longTapState.location.y - location.y) < LONG_TAP_THRESHOLD
        ) {
            return;
        }
        this.resetState();
    }

    static resetState(): void {
        clearTimeout(this.tapTimeout);
        longTapState = {
            minTapDuration: LONG_TAP_MIN_DURATION,
        };
    }

    static initState(event: ITouchEvent, callbackFn: Function): IEventState {
        if (WasabyTouchEvent.hasEventData(longTapState) || this.resetState()) {
            return;
        }
        handlerName = 'LongTap';
        longTapState = WasabyTouchEvent.initEventState(event, longTapState, this, handlerName);
        this.tapTimeout = setTimeout(() => {
            this.detectState(event);
            callbackFn();
        }, longTapState.minTapDuration);
        return longTapState;
    }
    private static eventCoordPatch(target: ILongTapEvent, patch: Touch): Event {
        target.clientX = patch.clientX;
        target.clientY = patch.clientY;
        target.pageX = patch.pageX;
        target.pageY = patch.pageY;
        target.screenX = patch.screenX;
        target.screenY = patch.screenY;
        return target;
    }
    private static detectLongTap(event: ITouchEvent): boolean {
        const currentTime = Date.now();
        let isLongTapEvent = false;
        if (
            event.target === longTapState.target &&
            currentTime - longTapState.time >= longTapState.minTapDuration
        ) {
            isLongTapEvent = true;
        }
        return isLongTapEvent;
    }

    static detectState(event: ITouchEvent): boolean {
        if (longTapState && longTapState.target) {
            const isLongTap = this.detectLongTap(event);
            if (isLongTap) {
                // block default action on long tap
                event.stopPropagation?.();
                let longTap = new Event('longtap') as any;
                longTap = this.eventCoordPatch(longTap, event.touches[0]);
                longTap.__$blockNextEvent = {
                    contextmenu: (_event: Event) => {
                        _event.preventDefault();
                        _event.stopPropagation();
                        return false;
                    },
                };
                const longTapCustom = new CustomEvent('longtap', {
                    detail: createEventDetails(longTap, event.target as Element),
                    bubbles: true,
                });
                event.target.dispatchEvent(longTapCustom);
                // prevent swipe event
                WasabyTouchEvent.stopInitializedHandler();
            }
            return isLongTap;
        }
    }
}
