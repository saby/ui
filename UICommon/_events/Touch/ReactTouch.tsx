import * as React from 'react';

import type { ITouchEvent, ITouchLocation } from './TouchEvents';

import { default as SyntheticEvent } from '../SyntheticEvent';

import { getDefaultState, TLocation } from './TouchConstants';

type TSwipeHandler = (event: React.SyntheticEvent, direction: string) => void;
type TLongTapHandler = (event: React.SyntheticEvent) => void;

export function useTouches(
    swipeHandler: TSwipeHandler | false | undefined,
    longTapHandler: TLongTapHandler | false | undefined
) {
    const touchStateRef = React.useRef(getDefaultState());

    const eventCoordPatch = (event: any, patch: Touch): Event => {
        event.clientX = patch.clientX;
        event.clientY = patch.clientY;
        event.pageX = patch.pageX;
        event.pageY = patch.pageY;
        event.screenX = patch.screenX;
        event.screenY = patch.screenY;
        return event;
    };

    const getTouchLocation = (event: ITouchEvent): TLocation => {
        const data = event.touches ? event.touches[0] : event;
        return {
            x: data.clientX as number,
            y: data.clientY as number,
        };
    };

    const isSwipe = (location: ITouchLocation): boolean => {
        /// Данная проверка необходима, чтобы не слать событие swipe, когда пользователь переходит по истории страниц
        /// вперед/назад свайпом - на это событие реагирует браузер. Отличительная черта такого события - swipe начинается
        /// на границах экрана по X.
        return (
            location.x - touchStateRef.current.deviationThreshold >= 0 &&
            location.x + touchStateRef.current.deviationThreshold <= window.innerWidth
        );
    };

    const detectSwipe = (
        eventTarget: EventTarget,
        currentTime: number,
        location: TLocation
    ): string | void => {
        let direction;
        if (
            eventTarget === touchStateRef.current.target &&
            touchStateRef.current.time - currentTime < touchStateRef.current.maxSwipeDuration
        ) {
            if (
                Math.abs(touchStateRef.current.location.x - location.x) >
                    touchStateRef.current.minSwipeDistance &&
                Math.abs(touchStateRef.current.location.y - location.y) <
                    touchStateRef.current.deviationThreshold
            ) {
                direction = touchStateRef.current.location.x > location.x ? 'left' : 'right';
            } else if (
                Math.abs(touchStateRef.current.location.y - location.y) >
                    touchStateRef.current.minSwipeDistance &&
                Math.abs(touchStateRef.current.location.x - location.x) <
                    touchStateRef.current.deviationThreshold
            ) {
                direction = touchStateRef.current.location.y > location.y ? 'top' : 'bottom';
            }
        }
        return direction;
    };

    const preventSwipeEvent = (): void => {
        touchStateRef.current.allowSwipe = false;
    };

    const starLongTapTask = (event: React.SyntheticEvent): void => {
        touchStateRef.current.longTapTask = setTimeout(() => {
            // block default action on long tap
            event.stopPropagation?.();
            if (longTapHandler) {
                longTapHandler(event);
            }
        }, touchStateRef.current.longTapDuration);
    };

    const resetLongTapTask = (): void => {
        const longTapTask = touchStateRef.current.longTapTask;
        if (longTapTask !== null) {
            clearTimeout(longTapTask);
        }
    };

    const handleTouchStart = (event: React.SyntheticEvent): void => {
        const location = getTouchLocation(event.nativeEvent);
        if (!isSwipe(location) || !swipeHandler) {
            preventSwipeEvent();
        }
        touchStateRef.current.time = Date.now();
        touchStateRef.current.location = location;
        touchStateRef.current.target = event.target;

        if (longTapHandler) {
            starLongTapTask(event);
        }
    };

    const handleTouchMove = (event: React.SyntheticEvent): void => {
        resetLongTapTask();
        if (!touchStateRef.current.allowSwipe) {
            return;
        }
        const direction = detectSwipe(
            event.target,
            Date.now(),
            getTouchLocation(event.nativeEvent)
        );

        if (direction) {
            if (swipeHandler) {
                swipeHandler(event, direction);
            }
            preventSwipeEvent();
        }
    };

    const handleTouchEnd = (): void => {
        resetLongTapTask();
        touchStateRef.current = getDefaultState();
    };

    const createWasabySwipeEvent = (event: React.SyntheticEvent, direction: string) => {
        const swipe = new Event('swipe') as any;
        swipe.direction = direction;
        event.target.dispatchEvent(swipe);
        return new SyntheticEvent(swipe);
    };

    const createWasabyLongTapEvent = (event: React.SyntheticEvent) => {
        let longTap = new Event('longtap') as any;
        longTap = eventCoordPatch(longTap, (event as any).touches[0]);
        longTap.__$blockNextEvent = {
            contextmenu: (_event: Event) => {
                _event.preventDefault();
                _event.stopPropagation();
                return false;
            },
        };
        event.target.dispatchEvent(longTap);
        return new SyntheticEvent(longTap);
    };

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        createWasabySwipeEvent,
        createWasabyLongTapEvent,
    };
}
