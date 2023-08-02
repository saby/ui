import { ISyntheticEvent, IEventConfig } from './IEvents';
import { detection } from 'Env/Env';
import { getSvgParentNode } from 'UICommon/Utils';
import { Logger } from 'UICommon/Utils';

/**
 * Перехватываем события дома на этапе всплытия, и поэтому далее сами
 * должны правильно распространить их.
 * Некоторые события не всплывают (флаги взяты из документации)
 */
const domEventsBubbling = {
    animationend: true,
    blur: false,
    error: false,
    focus: false,
    load: false,
    mouseenter: false,
    mouseleave: false,
    resize: false,
    scroll: false,
    unload: false,
    click: true,
    change: true,
    compositionend: true,
    compositionstart: true,
    compositionupdate: true,
    copy: true,
    cut: true,
    paste: true,
    dblclick: true,
    focusin: true,
    focusout: true,
    input: true,
    keydown: true,
    keypress: true,
    keyup: true,
    mousedown: true,
    mousemove: true,
    mouseout: true,
    mouseover: true,
    mouseup: true,
    select: true,
    wheel: true,
    touchstart: true,
    touchend: true,
    touchmove: true,
    contextmenu: true,
    swipe: true,
    longtap: true,
};

/**
 * Класс искусственных событий Wasaby.
 * @class UICommon/_events/SyntheticEvent
 * @remark <a href="/doc/platform/developmentapl/interface-development/ui-library/events/">Работа с событиями</a>
 * @public
 */
export default class SyntheticEvent<
    TNativeEvent extends Event = Event & { stopBubbling?: boolean }
> implements ISyntheticEvent
{
    /**
     * Нативное событие, генерируемое пользователем или API
     */
    _nativeEvent: TNativeEvent;

    get nativeEvent() {
        // в ie Object.keys() для события будет всегда возвращать пустой массив, т.к. ie не поддерживает new Event()
        // поэтому если в ie есть объект _nativeEvent значит считаем что событие есть
        if (
            !this._nativeEvent ||
            this._nativeEvent === null ||
            (!detection.isIE && !Object.keys(this._nativeEvent).length)
        ) {
            return null;
        }
        return this._nativeEvent?.nativeEvent || this._nativeEvent;
    }

    set nativeEvent(value: TNativeEvent) {
        this._nativeEvent = value;
    }

    /**
     * Название события
     */
    type: string;

    /**
     * Объект, на котором произошло событие
     */
    target: EventTarget;

    /**
     * Объект, на котором обрабатывается событие
     */
    currentTarget: EventTarget;

    result: unknown;

    private stopped: boolean;
    private _bubbling: boolean;

    constructor(nativeEvent: TNativeEvent, eventConfig?: IEventConfig) {
        const config = nativeEvent ? nativeEvent : eventConfig;

        this.nativeEvent = nativeEvent ? nativeEvent : null;
        this.type = config.type;
        const validTarget = config.target !== undefined;
        if (
            !validTarget &&
            typeof window !== 'undefined' &&
            window.navigator.userAgent.indexOf('jsdom') === -1
        ) {
            // в юнитах не выводим ошибку, т.к. в ряде юнитов мокнутый SyntheticEvent, который может быть без target
            Logger.warn(
                'Необходимо указать target при создании синтетического события.'
            );
        }
        if (validTarget) {
            this.target = getSvgParentNode(config.target);
            this.currentTarget = config.target;
        }
        this._bubbling = nativeEvent
            ? domEventsBubbling[config.type]
            : eventConfig && eventConfig._bubbling;
        this.stopped = false;
    }

    private stomCustomEventPropagation(): void {
        if (
            (typeof document !== 'undefined' &&
                this.nativeEvent instanceof CustomEvent) ||
            (detection.isIE && !!this._nativeEvent?.target)
        ) {
            this.nativeEvent.stopPropagation();
            this.nativeEvent.stopImmediatePropagation();
        }
    }
    /**
     * Останавливает распространение события далее
     * @return void
     */
    stopPropagation(): void {
        this.stopped = true;
        this.stomCustomEventPropagation();
    }

    /**
     * Останавливает распространение синтетического события далее, нативное продолжит распространение
     * @return void
     */
    stopSyntheticEvent(): void {
        this.stopped = true;
        this.stomCustomEventPropagation();
    }

    /**
     * Возвращает состояние распространения события (true - событие далее не распространяем)
     * @returns {boolean}
     */
    isStopped(): boolean {
        return this.stopped;
    }

    /**
     * Возвращает состояние распространения нативного события (true - событие далее не распространяем)
     * @returns {boolean}
     */
    isNativeStopped(): boolean {
        return this.nativeEvent && this.nativeEvent.stopped;
    }

    /**
     * Возвращает состояние всплытия события (true - событие всплывает дальше)
     * @returns {boolean}
     */
    isBubbling(): boolean {
        return this._bubbling;
    }

    /**
     * Отменяет событие (если возможно остановить всплытие у nativeEvent)
     * @return void
     */
    preventDefault(): void {
        if (this.nativeEvent) {
            this.nativeEvent.preventDefault();
        }
    }

    /**
     * Возвращает true, если событие нужно распространять далее
     * @returns {boolean}
     */
    propagating(): boolean {
        return this._bubbling === true && this.stopped === false;
    }

    /**
     * Останавливает распространение события далее
     * @return void
     */
    stopImmediatePropagation(): void {
        this.stopPropagation();
        this.stomCustomEventPropagation();
    }
}
