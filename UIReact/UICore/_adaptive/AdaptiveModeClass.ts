import { detection, experimental } from 'Env/Env';
import { IAspects } from './Aspects';

//todo а он мне нужен? есть же класс
export type AdaptiveModeType = {
    width: Width;
    height: Height;
    orientation: Orientation;
    device: Device;

    _cloneIfNeed: (aspects: IAspects) => AdaptiveModeType
};

const STANDARD_PHONE_SIZE = 640;
const STANDARD_TABLET_SIZE = 768;
const STANDARD_DESKTOP_SIZE = 1024;

export const DEFAULT_BREAKPOINTS = {
    sm: STANDARD_PHONE_SIZE,
    md: STANDARD_TABLET_SIZE,
    lg: STANDARD_DESKTOP_SIZE,
};

class Width {
    readonly value: number;
    constructor(props: { width: number }) {
        this.value = props.width;
    }

    up(value: number) {
        return value <= this.value;
    }
    between(start: number, end: number) {
        return start <= this.value && this.value < end;
    }
}
class Height {
    readonly value: number;
    constructor(props: { height: number }) {
        this.value = props.height;
    }

    up(value: number) {
        return value <= this.value;
    }
    between(start: number, end: number) {
        return start <= this.value && this.value < end;
    }
}
class Orientation {
    _isVertical: boolean;
    constructor({ isVertical }) {
        if (typeof window !== 'undefined') {
            this._isVertical =
                isVertical ??
                experimental.Screen.detectOrientation(window) === 'portrait';
        } else {
            this._isVertical = isVertical;
        }
    }
    isHorizontal() {
        return !this._isVertical;
    }
    isVertical() {
        return this._isVertical;
    }
}
class Device {
    _isPhone: boolean;
    _isTablet: boolean;
    _isTouch: boolean;
    constructor({ isPhone, isTablet, isTouch }) {
        this._isPhone =
            isPhone ?? (detection.isMobilePlatform && detection.isPhone);
        this._isTablet =
            isTablet ?? (detection.isMobilePlatform && !detection.isPhone);
        this._isTouch = isTouch;
    }
    isPhone() {
        return this._isPhone;
    }
    isTablet() {
        return this._isTablet;
    }
    isTouch() {
        return this._isTouch;
    }
}

export class AdaptiveModeClass implements AdaptiveModeType {
    width: Width;
    height: Height;
    orientation: Orientation;
    device: Device;
    private readonly _aspects: IAspects;

    constructor(params: IAspects) {
        this._aspects = params;
        this.width = new Width({ width: params.width });
        this.height = new Height({ height: params.height });
        this.orientation = new Orientation({ isVertical: params.isVertical });
        this.device = new Device({
            isPhone: params.isPhone,
            isTablet: params.isTablet,
            isTouch: params.isTouch,
        });
    }
    _cloneIfNeed(aspects: IAspects): AdaptiveModeClass {
        if (!aspects) {
            return this;
        }
        const newAspects: IAspects = {
            width: aspects.width ?? this._aspects.width,
            height: aspects.height ?? this._aspects.height,
            isTouch: aspects.isTouch ?? this._aspects.isTouch,
            isVertical: aspects.isVertical ?? this._aspects.isVertical,
            isPhone: aspects.isPhone ?? this._aspects.isPhone,
            isTablet: aspects.isTablet ?? this._aspects.isTablet,
        };
        const oldAspects = this._aspects;
        if (oldAspects.width !== newAspects.width ||
            oldAspects.height !== newAspects.height ||
            oldAspects.isTouch !== newAspects.isTouch ||
            oldAspects.isVertical !== newAspects.isVertical ||
            oldAspects.isPhone !== newAspects.isPhone ||
            oldAspects.isTablet !== newAspects.isTablet
        ) {
            return new AdaptiveModeClass(newAspects);
        }
        return this;
    }
}
