/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import type {
    IEventConfig,
    TWasabyEvent,
    IHandlerInfo,
    ITouchHandlers,
    TEventObject,
    TReactEvent,
    TTemplateEventObject,
} from 'UICommon/Events';
import type { TModifyHTMLNode } from 'UICommon/interfaces';

import { EventUtils, BuildTouchHandlers } from 'UICommon/Events';

export type { TWasabyEvent, TEventObject, TTemplateEventObject, TReactEvent };

/**
 */
const initializedEventSystem = new Map();

export default class TouchEventsReact {
    private capturedEventHandlers: Record<string, IHandlerInfo[]>;

    protected wasNotifyList: string[] = [];
    protected lastNotifyEvent: string = '';
    protected needBlockNotify: boolean = false;

    protected _rootDOMNode: TModifyHTMLNode;
    private dontUseParentOnRoot: boolean = true;

    private _touchHandlers: ITouchHandlers;

    private eventListenersRemovers: (() => void)[] = [];

    constructor(rootNode: TModifyHTMLNode) {
        this._rootDOMNode = rootNode;
        this.capturedEventHandlers = {};
        this._touchHandlers = new BuildTouchHandlers();
        this.initHandlers();
    }

    protected initHandlers(): void {
        this.addCaptureProcessingHandler('click', this._touchHandlers.handlerClick);
        this.addCaptureProcessingHandler('touchstart', this._touchHandlers.handlerTouchstart);
        this.addCaptureProcessingHandler('touchmove', this._touchHandlers.handlerTouchmove);
        this.addCaptureProcessingHandler('touchend', this._touchHandlers.handlerTouchend);
    }

    private addCaptureProcessingHandler(eventName: string, method: Function): void {
        if (this._rootDOMNode) {
            const handler = function (e: Event): void {
                method.apply(this, arguments);
            };
            this.addHandler(eventName, handler);
        }
    }

    /**
     * Добавление обработчика на фазу захвата.
     * Для системы событий есть два вида обработчиков на фазу захвата:
     * 1. Обработчик, который добавили просто потому,
     * что кто-то подписался на такое событие через on:eventName="handler()".
     * Такие обработчики помечаем как processingHandler:false.
     * 2. Обработчик, который мы добавляем в конструкторе DOMEnvironment. Такие обработчики нужны,
     * потому что некоторые события необходимо обработать в самой системе событий, а не в контроле.
     * Например, события touchmove, touchstart и touchend. Их необходимо обработать, потому что система событий wasaby
     * умеет распознавать два других типа тач-событий: longtap и swipe. Для таких событий processingHandler:true
     * @param {string} eventName - имя событий
     * @param {Function} handler - функция обработчик
     */
    private addHandler(eventName: string, handler: EventListener): void {
        const elementToSubscribe = this.dontUseParentOnRoot
            ? this._rootDOMNode
            : (this._rootDOMNode.parentNode as HTMLElement);
        const nativeEventName = EventUtils.fixUppercaseDOMEventName(eventName);
        const handlers = this.capturedEventHandlers;
        const handlerInfo = this.getHandlerInfo(eventName);
        if (handlerInfo === null) {
            let listenerCfg: IEventConfig = { capture: true };
            const newHandlerInfo: IHandlerInfo = {
                handler,
                bodyEvent: false,
                processingHandler: true,
                count: 0,
            };
            listenerCfg = this.fixPassiveEventConfig(eventName, listenerCfg);
            newHandlerInfo.bodyEvent = false;
            if (!handlers[eventName]) {
                handlers[eventName] = [];
            }
            handlers[eventName].push(newHandlerInfo);
            const bindedHandler = function (e: Event): void {
                handler.apply(this, arguments);
            }.bind(this);
            if (!elementToSubscribe[nativeEventName + '_subscribed']) {
                this.addNativeListener(
                    elementToSubscribe,
                    bindedHandler,
                    nativeEventName,
                    listenerCfg
                );
                elementToSubscribe[nativeEventName + '_subscribed'] = true;
            }
            return;
        }
    }

    private addNativeListener(
        element: HTMLElement,
        handler: EventListener,
        eventName: string,
        config: IEventConfig
    ): void {
        element.addEventListener(eventName, handler, config);

        this.eventListenersRemovers.push(() => {
            // Чтобы отписка точно сработала, лучше указывать те же аргумнты, что и в подписке.
            element.removeEventListener(eventName, handler, config);
        });
    }

    private removeAllCaptureHandlers(): void {
        if (!this._rootDOMNode.parentNode || (this.dontUseParentOnRoot && !this._rootDOMNode)) {
            return;
        }
        for (const eventListenersRemover of this.eventListenersRemovers) {
            eventListenersRemover();
        }
    }

    private getHandlerInfo(eventName: string): IHandlerInfo {
        const handlers = this.capturedEventHandlers;
        if (handlers[eventName]) {
            for (let i = 0; i < handlers[eventName].length; i++) {
                if (
                    handlers[eventName][i].processingHandler === true &&
                    handlers[eventName][i].bodyEvent === false
                ) {
                    return handlers[eventName][i];
                }
            }
        }
        return null;
    }

    /**
     * Определяем случаи, в которых нужно явно выставлять параметр passive:
     * false в конфиге нативного обработчика события
     * @param {string} eventName - имя события, которое хотим обработать
     * @param config - конфиг, в который добавится поле passive, если нужно.
     * @returns {any}
     */
    private fixPassiveEventConfig(eventName: string, config: IEventConfig): IEventConfig {
        if (EventUtils.checkPassiveFalseEvents(eventName)) {
            config.passive = false;
        }
        return config;
    }
    //# endregion

    destroy(): void {
        this.removeAllCaptureHandlers();
        this.capturedEventHandlers = {};
    }

    static initInstance(rootDOM?: TModifyHTMLNode): TouchEventsReact {
        if (!initializedEventSystem.size || !initializedEventSystem.get(rootDOM)) {
            const root = rootDOM || document.body;
            initializedEventSystem.set(rootDOM, new TouchEventsReact(root));
        }
        return initializedEventSystem.get(rootDOM);
    }

    static destroyInstance(rootDOM: HTMLElement): void {
        if (initializedEventSystem.size && initializedEventSystem.get(rootDOM)) {
            initializedEventSystem.get(rootDOM).destroy();
            initializedEventSystem.delete(rootDOM);
        }
    }
}
