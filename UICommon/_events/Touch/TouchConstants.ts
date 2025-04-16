/**
 * Время через которое сработает обработчик longTap
 */
export const LONG_TAP_MIN_DURATION = 500;

/**
 * Дистанция при которой не сбрасывается таймер longTap
 */
export const LONG_TAP_THRESHOLD = 25;

/**
 * Минимальное расстояние в пикселях для вызова swipe
 */
export const SWIPE_MIN_DISTANCE = 50;

/**
 * Максимальное расстояние в пикселях для вызова swipe
 */
export const SWIPE_MAX_DISTANCE = 600;

/**
 * Отступ от края экрана, который необходим для работы нативных механизмов браузера
 */
export const SWIPE_THRESHOLD = 25;

export type TLocation = { x: number; y: number };

export interface ITouchState {
    location: TLocation;
    minSwipeDistance: number;
    deviationThreshold: number;
    maxSwipeDuration: number;
    longTapDuration: number;
    time: number;
    target: EventTarget | null;
    allowSwipe: boolean;
    longTapTask: ReturnType<typeof setTimeout> | null;
}

export function getDefaultState(): ITouchState {
    return {
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
}
