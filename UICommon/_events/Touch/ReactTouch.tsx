import * as React from 'react';

import type { ITouchEvent, ITouchLocation } from './TouchEvents';

import { default as SyntheticEvent } from '../SyntheticEvent';

type TLocation = { x: number; y: number };

interface ISyntheticEvent extends ITouchEvent {
    nativeEvent: ITouchEvent;
}
export function useTouches(swipeHandler, longTapHandler) {
    const defaultState = {
        location: {
            x: 0,
            y: 0,
        },
        minSwipeDistance: 50,
        deviationThreshold: 25,
        maxSwipeDuration: 600,
        longTapDuration: 1000,
        time: 0,
        target: null,
        allowSwipe: true,
        longTapTask: null,
    };

    const getDefaultState = () => {
        return { ...defaultState };
    };

    const touchStateRef = React.useRef(getDefaultState());

    const eventCoordPatch = (event, patch: Touch): Event => {
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
            x: data.clientX,
            y: data.clientY,
        };
    };

    const isSwipe = (location: ITouchLocation): boolean => {
        /// Данная проверка необходима, чтобы не слать событие swipe, когда пользователь переходит по истории страниц
        /// вперед/назад свайпом - на это событие реагирует браузер. Отличительная черта такого события - swipe начинается
        /// на границах экрана по X.
        return (
            location.x - touchStateRef.current.deviationThreshold >= 0 &&
            location.x + touchStateRef.current.deviationThreshold <=
                window.innerWidth
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
            touchStateRef.current.time - currentTime <
                touchStateRef.current.maxSwipeDuration
        ) {
            if (
                Math.abs(touchStateRef.current.location.x - location.x) >
                    touchStateRef.current.minSwipeDistance &&
                Math.abs(touchStateRef.current.location.y - location.y) <
                    touchStateRef.current.deviationThreshold
            ) {
                direction =
                    touchStateRef.current.location.x > location.x
                        ? 'left'
                        : 'right';
            } else if (
                Math.abs(touchStateRef.current.location.y - location.y) >
                    touchStateRef.current.minSwipeDistance &&
                Math.abs(touchStateRef.current.location.x - location.x) <
                    touchStateRef.current.deviationThreshold
            ) {
                direction =
                    touchStateRef.current.location.y > location.y
                        ? 'top'
                        : 'bottom';
            }
        }
        return direction;
    };

    const preventSwipeEvent = (): void => {
        touchStateRef.current.allowSwipe = false;
    };

    const starLongTapTask = (event: ITouchEvent): void => {
        touchStateRef.current.longTapTask = setTimeout(() => {
            // block default action on long tap
            event.stopPropagation?.();
            longTapHandler(event);
        }, touchStateRef.current.longTapDuration);
    };

    const resetLongTapTask = (): void => {
        clearTimeout(touchStateRef.current.longTapTask);
    };

    const handleTouchStart = (event: ISyntheticEvent): void => {
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

    const handleTouchMove = (event: ISyntheticEvent): void => {
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
            swipeHandler(event, direction);
            preventSwipeEvent();
        }
    };

    const handleTouchEnd = (): void => {
        resetLongTapTask();
        touchStateRef.current = getDefaultState();
    };

    const createWasabySwipeEvent = (event, direction) => {
        const swipe = new Event('swipe') as any;
        swipe.direction = direction;
        event.target.dispatchEvent(swipe);
        return new SyntheticEvent(swipe);
    };

    const createWasabyLongTapEvent = (event) => {
        let longTap = new Event('longtap') as any;
        longTap = eventCoordPatch(longTap, event.touches[0]);
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
        createWasabySwipeEvent,
        createWasabyLongTapEvent,
    };
}
