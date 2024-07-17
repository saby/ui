/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { detection, constants, experimental } from 'Env/Env';
import { IAspects, Storage } from './Aspects';
import { TouchDetect } from 'EnvTouch/EnvTouch';
import { cookie, getStore } from 'Application/Env';
import { ISizes, SizeTracker } from './SizeTracker';

/**
 * Интерфейс инструмента adaptiveMode, позволяющего проверять аспекты адаптивности на соответствие требованиям
 * @see https://n.sbis.ru/wasaby/knowledge#toc_2eb25e0a-c867-45a8-a13d-b8c1ff12cdbc
 * @public
 */
export interface AdaptiveModeType {
    /**
     * Проверяет аспект адаптивности размеры контейнера
     */
    container: {
        clientWidth: Size;
        clientHeight: Size;
    };
    /**
     * Проверяет аспект адаптивности размеры браузера
     */
    window: {
        innerWidth: Size;
        innerHeight: Size;
        outerWidth: Size;
        outerHeight: Size;
        viewportWidth: Size;
        viewportHeight: Size;
    };
    /**
     * Проверяет аспект адаптивности ориентация устройства
     */
    orientation: Orientation;
    /**
     * Проверяет аспекты адаптивности, связанные с типом устройства
     */
    device: Device;

    _cloneIfNeed: (aspects: IAspects) => AdaptiveModeType;
}

class Size {
    readonly value: number;
    readonly valueMayBeIncorrect: boolean;
    constructor(props: { value: number; valueMayBeIncorrect: boolean }) {
        this.value = props.value;
        this.valueMayBeIncorrect = props.valueMayBeIncorrect;
    }

    up(value: number) {
        return value <= this.value;
    }
    between(start: number, end: number) {
        return start <= this.value && this.value < end;
    }
}

interface IOrientation {
    isVertical?: boolean;
}
class Orientation {
    private readonly _isVertical: boolean;
    constructor({ isVertical }: IOrientation) {
        if (typeof isVertical === 'boolean') {
            // принудительно задали значение
            this._isVertical = isVertical;
        } else {
            // на клиенте можем взять точное значение, на сервере попробуем из куки
            if (typeof window !== 'undefined') {
                this._isVertical = experimental.Screen.detectOrientation(window) === 'portrait'; // актуализируем куку
                Storage.getInstance().set({ isVertical: this._isVertical });
            } else {
                this._isVertical = Storage.getInstance().get().isVertical;
            }
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

function getActualIsTouch(): boolean {
    // если мобильная платформа - всегда тач.
    // на клиенте вычисляем значение, на сервере пробуем из куки
    return (
        detection.isMobilePlatform ||
        (typeof window !== 'undefined'
            ? touchDetector?.isTouch()
            : Storage.getInstance().get()?.isTouch) ||
        false
    );
}
interface IDevice {
    isPhone?: boolean;
    isTablet?: boolean;
    isTouch?: boolean;
}
class Device {
    private readonly _isPhone: boolean;
    private readonly _isTablet: boolean;
    private readonly _isTouch: boolean;
    constructor({ isPhone, isTablet, isTouch }: IDevice) {
        const realIsPhone = detection.isMobilePlatform && detection.isPhone;
        const realIsTablet = detection.isMobilePlatform && !detection.isPhone;
        const realIsTouch = getActualIsTouch();

        this._isPhone = isPhone ?? realIsPhone;
        // учитываем куку useAdaptive, этот флаг меняется при переходе в мобильную/полную версию сайта
        this._isPhone = this._isPhone && cookie.get('useAdaptive') !== 'false';
        this._isTablet = isTablet ?? realIsTablet;
        this._isTouch = isTouch ?? realIsTouch;

        if (typeof window !== 'undefined') {
            // актуализируем куку
            Storage.getInstance().set({
                isPhone: realIsPhone,
                isTablet: realIsTablet,
                isTouch: realIsTouch,
            });
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

interface ISerialized {
    $serialized$: string;
    module: string;
    id: number;
    state: IAspects;
}

export class AdaptiveModeClass implements AdaptiveModeType {
    // @deprecated
    width: Size;
    // @deprecated
    height: Size;

    container: {
        clientWidth: Size;
        clientHeight: Size;
    };
    window: {
        innerWidth: Size;
        innerHeight: Size;
        outerWidth: Size;
        outerHeight: Size;
        viewportWidth: Size;
        viewportHeight: Size;
    };
    orientation: Orientation;
    device: Device;
    private readonly _aspects: IAspects;

    constructor(params: IAspects) {
        this._aspects = params;
        const aspects = Storage.getInstance().get();
        const hasAspects = !!(
            aspects?.hasOwnProperty('windowInnerWidth') &&
            aspects?.hasOwnProperty('windowInnerHeight')
        );
        const valueMayBeIncorrect = !constants.isBrowserPlatform && !hasAspects;
        // todo удалить когда переведу все использования на новое апи
        this.width = new Size({ value: params.containerClientWidth, valueMayBeIncorrect });
        this.height = new Size({ value: params.containerClientHeight, valueMayBeIncorrect });
        this.container = {
            clientWidth: new Size({ value: params.containerClientWidth, valueMayBeIncorrect }),
            clientHeight: new Size({ value: params.containerClientHeight, valueMayBeIncorrect }),
        };
        this.window = {
            innerWidth: new Size({ value: params.windowInnerWidth, valueMayBeIncorrect }),
            innerHeight: new Size({ value: params.windowInnerHeight, valueMayBeIncorrect }),
            outerWidth: new Size({ value: params.windowOuterWidth, valueMayBeIncorrect }),
            outerHeight: new Size({ value: params.windowOuterHeight, valueMayBeIncorrect }),
            viewportWidth: new Size({ value: params.viewportWidth, valueMayBeIncorrect }),
            viewportHeight: new Size({ value: params.viewportHeight, valueMayBeIncorrect }),
        };
        this.orientation = new Orientation({ isVertical: params.isVertical });
        this.device = new Device({
            isPhone: params.isPhone,
            isTablet: params.isTablet,
            isTouch: params.isTouch,
        });

        // обновим актуальное значение. при инициализации могли вычислиться правильные значения.
        // на сервере надо будет сериализовать все состояние, чтобы можно было восстановить.
        // size не надо обновлять - там не вычисляется ничего.
        params.isVertical = this.orientation.isVertical();
        params.isPhone = this.device.isPhone();
        params.isTablet = this.device.isTablet();
        params.isTouch = this.device.isTouch();
    }
    _cloneIfNeed(aspects: IAspects): AdaptiveModeClass {
        if (!aspects) {
            return this;
        }
        const newAspects: IAspects = {
            windowInnerWidth: aspects.windowInnerWidth ?? this._aspects.windowInnerWidth,
            windowInnerHeight: aspects.windowInnerHeight ?? this._aspects.windowInnerHeight,
            windowOuterWidth: aspects.windowOuterWidth ?? this._aspects.windowOuterWidth,
            windowOuterHeight: aspects.windowOuterHeight ?? this._aspects.windowOuterHeight,
            viewportWidth: aspects.viewportWidth ?? this._aspects.viewportWidth,
            viewportHeight: aspects.viewportHeight ?? this._aspects.viewportHeight,
            containerClientWidth:
                aspects.containerClientWidth ?? this._aspects.containerClientWidth,
            containerClientHeight:
                aspects.containerClientHeight ?? this._aspects.containerClientHeight,
            isTouch: aspects.isTouch ?? this._aspects.isTouch,
            isVertical: aspects.isVertical ?? this._aspects.isVertical,
            isPhone: aspects.isPhone ?? this._aspects.isPhone,
            isTablet: aspects.isTablet ?? this._aspects.isTablet,
        };
        const oldAspects = this._aspects;
        if (
            oldAspects.windowInnerWidth !== newAspects.windowInnerWidth ||
            oldAspects.windowInnerHeight !== newAspects.windowInnerHeight ||
            oldAspects.windowOuterWidth !== newAspects.windowOuterWidth ||
            oldAspects.windowOuterHeight !== newAspects.windowOuterHeight ||
            oldAspects.viewportWidth !== newAspects.viewportWidth ||
            oldAspects.viewportHeight !== newAspects.viewportHeight ||
            oldAspects.containerClientWidth !== newAspects.containerClientWidth ||
            oldAspects.containerClientHeight !== newAspects.containerClientHeight ||
            oldAspects.isVertical !== newAspects.isVertical ||
            oldAspects.isPhone !== newAspects.isPhone ||
            oldAspects.isTablet !== newAspects.isTablet ||
            oldAspects.isTouch !== newAspects.isTouch ||
            (typeof oldAspects.isTouch === 'undefined' &&
                this.device.isTouch() !== getActualIsTouch())
        ) {
            return new AdaptiveModeClass(newAspects);
        }
        return this;
    }
    toJSON(): ISerialized {
        const countStr = getStore('AdaptiveModeClass').get('count') || '0';
        const count = parseInt(countStr, 10);
        const newCount = count + 1;
        getStore('AdaptiveModeClass').set('count', newCount + '');

        return {
            $serialized$: 'inst',
            module: 'UICore/Adaptive:_AdaptiveModeClass',
            id: newCount,
            state: {
                containerClientWidth: this.container.clientWidth.valueMayBeIncorrect
                    ? undefined
                    : this.container.clientWidth.value,
                containerClientHeight: this.container.clientHeight.valueMayBeIncorrect
                    ? undefined
                    : this.container.clientHeight.value,
            },
        };
    }
    static fromJSON(data: ISerialized) {
        let _sizes: ISizes;
        const sizeTracker = new SizeTracker();
        sizeTracker.check((sizes) => {
            _sizes = sizes;
        })();

        const aspects: IAspects = _sizes;
        aspects.containerClientWidth =
            data.state.containerClientWidth ?? aspects.containerClientWidth;
        aspects.containerClientHeight =
            data.state.containerClientHeight ?? aspects.containerClientHeight;
        return new AdaptiveModeClass(aspects);
    }
}