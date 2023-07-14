import { detection, experimental } from 'Env/Env';
import { IAspects, Storage } from './Aspects';
import { TouchDetect } from 'EnvTouch/EnvTouch';
import { cookie } from 'Application/Env';

//todo а он мне нужен? есть же класс
export type AdaptiveModeType = {
    container: {
        clientWidth: Size;
        clientHeight: Size;
        scrollWidth: Size;
        scrollHeight: Size;
    };
    window: {
        innerWidth: Size;
        innerHeight: Size;
    };
    orientation: Orientation;
    device: Device;

    _cloneIfNeed: (aspects: IAspects) => AdaptiveModeType;
};

export const DEFAULT_BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};

class Size {
    readonly value: number;
    constructor(props: { value: number }) {
        this.value = props.value;
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
        if (typeof isVertical === 'boolean') {
            // принудительно задали значение
            this._isVertical = isVertical;
        } else {
            // на клиенте можем взять точное значение, на сервере попробуем из куки
            this._isVertical =
                typeof window !== 'undefined'
                    ? experimental.Screen.detectOrientation(window) === 'portrait'
                    : Storage.getInstance().get()?.isVertical;
            // актуализируем куку
            Storage.getInstance().set({ isVertical: this._isVertical });
        }
    }
    isHorizontal() {
        // если нет информации о ориентации, то и isVertical и isHorizontal вернут undefined.
        return typeof this._isVertical === 'boolean' ? !this._isVertical : undefined;
    }
    isVertical() {
        return this._isVertical;
    }
}

let touchDetector: TouchDetect;
if (typeof window !== 'undefined') {
    touchDetector = TouchDetect.getInstance();
}
class Device {
    _isPhone: boolean;
    _isTablet: boolean;
    _isTouch: boolean;
    constructor({ isPhone, isTablet, isTouch }) {
        this._isPhone = isPhone ?? (detection.isMobilePlatform && detection.isPhone);
        // учитываем куку useAdaptive, этот флаг меняется при переходе в мобильную/полную версию сайта
        this._isPhone = this._isPhone && cookie.get('useAdaptive') !== 'false';
        this._isTablet = isTablet ?? (detection.isMobilePlatform && !detection.isPhone);

        if (typeof isTouch === 'boolean') {
            this._isTouch = isTouch;
        } else {
            // если мобильная платформа - всегда тач.
            // на клиенте вычисляем значение, на сервере пробуем из куки
            this._isTouch =
                detection.isMobilePlatform ||
                (typeof window !== 'undefined'
                    ? touchDetector?.isTouch()
                    : Storage.getInstance().get()?.isTouch);
            // актуализируем куку
            Storage.getInstance().set({ isTouch: this._isTouch });
        }
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
    // @deprecated
    width: Size;
    // @deprecated
    height: Size;

    container: {
        clientWidth: Size;
        clientHeight: Size;
        scrollWidth: Size;
        scrollHeight: Size;
    };
    window: {
        innerWidth: Size;
        innerHeight: Size;
    };
    orientation: Orientation;
    device: Device;
    private readonly _aspects: IAspects;

    constructor(params: IAspects) {
        this._aspects = params;
        // todo удалить когда переведу все использования на новое апи
        this.width = new Size({ value: params.containerClientWidth });
        this.height = new Size({ value: params.containerClientHeight });
        this.container = {
            clientWidth: new Size({ value: params.containerClientWidth }),
            clientHeight: new Size({ value: params.containerClientHeight }),
            scrollWidth: new Size({ value: params.containerScrollWidth }),
            scrollHeight: new Size({ value: params.containerScrollHeight }),
        };
        this.window = {
            innerWidth: new Size({ value: params.windowInnerWidth }),
            innerHeight: new Size({ value: params.windowInnerHeight }),
        };
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
            windowInnerWidth: aspects.windowInnerWidth ?? this._aspects.windowInnerWidth,
            windowInnerHeight: aspects.windowInnerHeight ?? this._aspects.windowInnerHeight,
            containerClientWidth:
                aspects.containerClientWidth ?? this._aspects.containerClientWidth,
            containerClientHeight:
                aspects.containerClientHeight ?? this._aspects.containerClientHeight,
            containerScrollWidth:
                aspects.containerScrollWidth ?? this._aspects.containerScrollWidth,
            containerScrollHeight:
                aspects.containerScrollHeight ?? this._aspects.containerScrollHeight,
            isTouch: aspects.isTouch ?? this._aspects.isTouch,
            isVertical: aspects.isVertical ?? this._aspects.isVertical,
            isPhone: aspects.isPhone ?? this._aspects.isPhone,
            isTablet: aspects.isTablet ?? this._aspects.isTablet,
        };
        const oldAspects = this._aspects;
        if (
            oldAspects.windowInnerWidth !== newAspects.windowInnerWidth ||
            oldAspects.windowInnerHeight !== newAspects.windowInnerHeight ||
            oldAspects.containerClientWidth !== newAspects.containerClientWidth ||
            oldAspects.containerClientHeight !== newAspects.containerClientHeight ||
            oldAspects.containerScrollWidth !== newAspects.containerScrollWidth ||
            oldAspects.containerScrollHeight !== newAspects.containerScrollHeight ||
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
