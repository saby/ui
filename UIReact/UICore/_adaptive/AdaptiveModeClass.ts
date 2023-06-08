import { Logger } from 'UICommon/Utils';

export type AdaptiveModeType = {
    isEqual(breakpoints: string[]): boolean;
    between(first: string, second: string): boolean;
    up(breakpoint: string): boolean;
    getScreens(): ScreensType;
};
export type ScreensType = {
    [key: string]: number;
};

export const STANDARD_PHONE_WIDTH = 640;
export const STANDARD_TABLET_WIDTH = 768;
export const STANDARD_DESKTOP_WIDTH = 1024;

export const DEFAULT_BREAKPOINTS = {
    sm: STANDARD_PHONE_WIDTH,
    md: STANDARD_TABLET_WIDTH,
    lg: STANDARD_DESKTOP_WIDTH,
};

export class AdaptiveModeClass implements AdaptiveModeType {
    private _$internal_screens: ScreensType;
    private _$internal_curBreakpoint: string;
    constructor(
        screens: ScreensType = DEFAULT_BREAKPOINTS,
        curBreakpoint: string = null
    ) {
        this._$internal_screens = screens;
        this._$internal_curBreakpoint = curBreakpoint;
    }
    getScreens(): ScreensType {
        return { ...this._$internal_screens };
    }
    isEqual(breakpoints: string[]) {
        return breakpoints.indexOf(this._$internal_curBreakpoint) !== -1;
    }
    between(first: string, second: string) {
        const screens = this._$internal_screens;
        const curBreakpoint = this._$internal_curBreakpoint;

        if (typeof screens[first] !== 'number') {
            Logger.error(
                'Adaptive error: невалидный аргумент first в методе between. first равен ' +
                    first
            );
        }
        if (typeof screens[second] !== 'number') {
            Logger.error(
                'Adaptive error: невалидный аргумент second в методе between. second равен ' +
                    second
            );
        }
        if (screens[first] >= screens[second]) {
            Logger.error(
                'Adaptive error: невалидные аргументы first и second в методе between.' +
                    'first должен быть меньше second. first равен ' +
                    first +
                    ', second равен ' +
                    second
            );
        }
        return (
            screens[first] <= screens[curBreakpoint] &&
            screens[curBreakpoint] < screens[second]
        );
    }
    up(breakpoint: string): boolean {
        const screens = this._$internal_screens;
        const curBreakpoint = this._$internal_curBreakpoint;

        if (typeof screens[breakpoint] !== 'number') {
            Logger.error(
                'Adaptive error: невалидный аргумент breakpoint в методе up. breakpoint равен ' +
                    breakpoint
            );
        }
        return screens[breakpoint] <= screens[curBreakpoint];
    }
}
