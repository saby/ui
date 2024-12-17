import { createRef, SyntheticEvent } from 'react';
import type { ITouchEvent, ITouchLocation } from './TouchEvents';

import {
    LONG_TAP_MIN_DURATION,
    SWIPE_MIN_DISTANCE,
    SWIPE_MAX_DISTANCE,
    SWIPE_THRESHOLD,
} from './TouchConstants';

type TLocation = { x: number | undefined; y: number | undefined };

// eslint-disable-next-line @typescript-eslint/naming-convention
export class TouchEventPolyfill {
    private swipeHandler;
    private longTapHandler;
    private defaultState = {
        location: {
            x: 0,
            y: 0,
        },
        minSwipeDistance: SWIPE_MIN_DISTANCE,
        deviationThreshold: SWIPE_THRESHOLD,
        maxSwipeDuration: SWIPE_MAX_DISTANCE,
        longTapDuration: LONG_TAP_MIN_DURATION,
        time: 0,
        target: null,
        allowSwipe: true,
        longTapTask: null,
    };
    private touchStateRef = createRef();

    constructor(swipeHandler: Function, longTapHandler: Function) {
        this.swipeHandler = swipeHandler ? swipeHandler.bind(this) : () => {};
        this.longTapHandler = longTapHandler ? longTapHandler.bind(this) : () => {};
        this.getDefaultState = this.getDefaultState.bind(this);
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
        this.touchStateRef.current = this.getDefaultState();
    }

    private getDefaultState() {
        return { ...this.defaultState };
    }

    private getTouchLocation(event: ITouchEvent): TLocation {
        const data = event.touches ? event.touches[0] : event;
        return {
            x: data.clientX,
            y: data.clientY,
        };
    }

    private isSwipe(location: ITouchLocation): boolean {
        /// Данная проверка необходима, чтобы не слать событие swipe, когда пользователь переходит по истории страниц
        /// вперед/назад свайпом - на это событие реагирует браузер. Отличительная черта такого события - swipe начинается
        /// на границах экрана по X.
        return (
            location.x - this.touchStateRef.current.deviationThreshold >= 0 &&
            location.x + this.touchStateRef.current.deviationThreshold <= window.innerWidth
        );
    }

    private detectSwipe(
        eventTarget: EventTarget,
        currentTime: number,
        location: TLocation
    ): string | void {
        let direction;
        if (
            eventTarget === this.touchStateRef.current.target &&
            this.touchStateRef.current.time - currentTime <
                this.touchStateRef.current.maxSwipeDuration
        ) {
            if (
                location.x &&
                location.y &&
                Math.abs(this.touchStateRef.current.location.x - location.x) >
                    this.touchStateRef.current.minSwipeDistance &&
                Math.abs(this.touchStateRef.current.location.y - location.y) <
                    this.touchStateRef.current.deviationThreshold
            ) {
                direction = this.touchStateRef.current.location.x > location.x ? 'left' : 'right';
            } else if (
                location.x &&
                location.y &&
                Math.abs(this.touchStateRef.current.location.y - location.y) >
                    this.touchStateRef.current.minSwipeDistance &&
                Math.abs(this.touchStateRef.current.location.x - location.x) <
                    this.touchStateRef.current.deviationThreshold
            ) {
                direction = this.touchStateRef.current.location.y > location.y ? 'top' : 'bottom';
            }
        }
        return direction;
    }

    private preventSwipeEvent(): void {
        this.touchStateRef.current.allowSwipe = false;
    }

    private starLongTapTask(event: SyntheticEvent): void {
        this.touchStateRef.current.longTapTask = setTimeout(() => {
            // block default action on long tap
            event.stopPropagation?.();
            this.longTapHandler(event);
        }, this.touchStateRef.current.longTapDuration);
    }

    private resetLongTapTask(): void {
        clearTimeout(this.touchStateRef.current.longTapTask);
    }

    private onTouchStart(event: SyntheticEvent): void {
        const location = this.getTouchLocation(event.nativeEvent);
        if (!this.isSwipe(location as ITouchLocation) || !this.swipeHandler) {
            this.preventSwipeEvent();
        }
        this.touchStateRef.current.time = Date.now();
        this.touchStateRef.current.location = location;
        this.touchStateRef.current.target = event.target;

        if (this.longTapHandler) {
            this.starLongTapTask(event);
        }
    }

    private onTouchMove(event: SyntheticEvent): void {
        this.resetLongTapTask();
        if (!this.touchStateRef.current.allowSwipe) {
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
        this.touchStateRef.current = this.getDefaultState();
    }

    getTouches() {
        return {
            onTouchStart: this.onTouchStart,
            onTouchMove: this.onTouchMove,
            onTouchEnd: this.onTouchEnd,
        };
    }
}
