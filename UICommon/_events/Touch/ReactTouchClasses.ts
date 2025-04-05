import { SyntheticEvent } from 'react';
import type { ITouchEvent, ITouchLocation } from './TouchEvents';

import { getDefaultState, TLocation } from './TouchConstants';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class TouchEventPolyfill {
    private swipeHandler;
    private longTapHandler;
    private touchState = getDefaultState();

    constructor(
        swipeHandler: Function | false | undefined,
        longTapHandler: Function | false | undefined
    ) {
        this.swipeHandler = swipeHandler ? swipeHandler.bind(this) : () => {};
        this.longTapHandler = longTapHandler ? longTapHandler.bind(this) : () => {};
        this.getTouchLocation = this.getTouchLocation.bind(this);
        this.isSwipe = this.isSwipe.bind(this);
        this.detectSwipe = this.detectSwipe.bind(this);
        this.preventSwipeEvent = this.preventSwipeEvent.bind(this);
        this.starLongTapTask = this.starLongTapTask.bind(this);
        this.resetLongTapTask = this.resetLongTapTask.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.getTouches = this.getTouches.bind(this);
    }

    private getTouchLocation(event: ITouchEvent): TLocation {
        const data = event.touches ? event.touches[0] : event;
        return {
            x: data.clientX as number,
            y: data.clientY as number,
        };
    }

    private isSwipe(location: ITouchLocation): boolean {
        /// Данная проверка необходима, чтобы не слать событие swipe, когда пользователь переходит по истории страниц
        /// вперед/назад свайпом - на это событие реагирует браузер. Отличительная черта такого события - swipe начинается
        /// на границах экрана по X.
        return (
            location.x - this.touchState.deviationThreshold >= 0 &&
            location.x + this.touchState.deviationThreshold <= window.innerWidth
        );
    }

    private detectSwipe(
        eventTarget: EventTarget,
        currentTime: number,
        location: TLocation
    ): string | void {
        let direction;
        if (
            eventTarget === this.touchState.target &&
            this.touchState.time - currentTime < this.touchState.maxSwipeDuration
        ) {
            if (
                location.x &&
                location.y &&
                Math.abs(this.touchState.location.x - location.x) >
                    this.touchState.minSwipeDistance &&
                Math.abs(this.touchState.location.y - location.y) <
                    this.touchState.deviationThreshold
            ) {
                direction = this.touchState.location.x > location.x ? 'left' : 'right';
            } else if (
                location.x &&
                location.y &&
                Math.abs(this.touchState.location.y - location.y) >
                    this.touchState.minSwipeDistance &&
                Math.abs(this.touchState.location.x - location.x) <
                    this.touchState.deviationThreshold
            ) {
                direction = this.touchState.location.y > location.y ? 'top' : 'bottom';
            }
        }
        return direction;
    }

    private preventSwipeEvent(): void {
        this.touchState.allowSwipe = false;
    }

    private starLongTapTask(event: SyntheticEvent): void {
        this.touchState.longTapTask = setTimeout(() => {
            // block default action on long tap
            event.stopPropagation?.();
            this.longTapHandler(event);
        }, this.touchState.longTapDuration);
    }

    private resetLongTapTask(): void {
        const longTapTask = this.touchState.longTapTask;
        if (longTapTask !== null) {
            clearTimeout(longTapTask);
        }
    }

    private onTouchStart(event: SyntheticEvent): void {
        const location = this.getTouchLocation(event.nativeEvent);
        if (!this.isSwipe(location as ITouchLocation) || !this.swipeHandler) {
            this.preventSwipeEvent();
        }
        this.touchState.time = Date.now();
        this.touchState.location = location;
        this.touchState.target = event.target;

        if (this.longTapHandler) {
            this.starLongTapTask(event);
        }
    }

    private onTouchMove(event: SyntheticEvent): void {
        this.resetLongTapTask();
        if (!this.touchState.allowSwipe) {
            return;
        }
        const direction = this.detectSwipe(
            event.target,
            Date.now(),
            this.getTouchLocation(event.nativeEvent)
        );

        if (direction) {
            this.swipeHandler(event, direction);
            this.preventSwipeEvent();
        }
    }

    private onTouchEnd(): void {
        this.resetLongTapTask();
        this.touchState = getDefaultState();
    }

    getTouches() {
        return {
            onTouchStart: this.onTouchStart,
            onTouchMove: this.onTouchMove,
            onTouchEnd: this.onTouchEnd,
        };
    }
}
