import {
    IEventState,
    ITouchEvent,
    ITouchLocation,
    WasabyTouchEvent,
} from './TouchEvents';
import { default as SyntheticEvent } from '../SyntheticEvent';

let swipeState;
let handlerName;

export class SwipeController {
    // TODO: с переходом на адаптив эти значения могут быть не актуальны
    static resetState(): void {
        swipeState = {
            minSwipeDistance: 50,
            deviationThreshold: 25,
            maxSwipeDuration: 600,
        };
    }

    static initState(event: ITouchEvent): IEventState {
        const location = WasabyTouchEvent.getTouchLocation(event);
        if (
            WasabyTouchEvent.hasEventData(swipeState) ||
            this.resetState() ||
            !this.isSwipe(location)
        ) {
            return;
        }
        handlerName = 'Swipe';
        swipeState = WasabyTouchEvent.initEventState(
            event,
            swipeState,
            this,
            handlerName
        );
    }

    private static isSwipe(location: ITouchLocation): boolean {
        /// Данная проверка необходима, чтобы не слать событие swipe, когда пользователь переходит по истории страниц
        /// вперед/назад свайпом - на это событие реагирует браузер. Отличительная черта такого события - swipe начинается
        /// на границах экрана по X.
        return (
            location.x - swipeState.deviationThreshold >= 0 &&
            location.x + swipeState.deviationThreshold <= window.innerWidth
        );
    }

    private static detectSwipe(event: ITouchEvent): string {
        const currentTime = Date.now();
        const location = WasabyTouchEvent.getTouchLocation(event);
        let direction;
        if (
            event.target === swipeState.target &&
            swipeState.time - currentTime < swipeState.maxSwipeDuration
        ) {
            if (
                Math.abs(swipeState.location.x - location.x) >
                    swipeState.minSwipeDistance &&
                Math.abs(swipeState.location.y - location.y) <
                    swipeState.deviationThreshold
            ) {
                direction =
                    swipeState.location.x > location.x ? 'left' : 'right';
            } else if (
                Math.abs(swipeState.location.y - location.y) >
                    swipeState.minSwipeDistance &&
                Math.abs(swipeState.location.x - location.x) <
                    swipeState.deviationThreshold
            ) {
                direction =
                    swipeState.location.y > location.y ? 'top' : 'bottom';
            }
        }
        return direction;
    }

    static detectState(event: ITouchEvent): void {
        if (swipeState && swipeState.target) {
            const swipeDirection = this.detectSwipe(event);
            if (swipeDirection) {
                const swipe = new Event('swipe') as any;
                swipe.direction = swipeDirection;
                const syntheticEvent = new SyntheticEvent(swipe);
                syntheticEvent.target = event.target;
                const swipeCustom = new CustomEvent('swipe', {
                    detail: {
                        isProcessing: true,
                        syntheticEvent,
                    },
                    bubbles: true,
                });
                event.target.dispatchEvent(swipeCustom);
                this.resetState();
            }
        }
    }
}
