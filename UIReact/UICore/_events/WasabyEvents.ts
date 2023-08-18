import { detection, constants } from 'Env/Env';
import type {
    TWasabyEvent,
    TEventObject,
    TReactEvent,
    TTemplateEventObject,
} from 'UICommon/Events';
import type { TModifyHTMLNode } from 'UICommon/interfaces';

import { Logger } from 'UICommon/Utils';
import { Control } from 'UICore/Base';
import { Set } from 'Types/shim';
import { prepareEvents } from './PrepareWasabyEvent';

export { REACT_FAKE_CONTROL } from './PrepareWasabyEvent';
export type { TWasabyEvent, TEventObject, TTemplateEventObject, TReactEvent };
type TElement = HTMLElement & {
    _container?: HTMLElement;
};

const inputTagNames = new Set(['input', 'INPUT', 'textarea', 'TEXTAREA']);

/**
 */
const initializedEventSystem = new Map();

export default class WasabyEventsReact {
    protected wasNotifyList: string[] = [];
    protected lastNotifyEvent: string = '';
    protected needBlockNotify: boolean = false;

    protected _rootDOMNode: TModifyHTMLNode;
    private dontUseParentOnRoot: boolean = true;

    private eventListenersRemovers: (() => void)[] = [];

    //# region инициализация системы событий
    constructor(rootNode: TModifyHTMLNode) {
        this._rootDOMNode = rootNode;
        this.initEventSystemFixes();
    }

    private initEventSystemFixes(): void {
        // Edge (IE12) иногда стреляет selectstart при клике на элемент с user-select: none, и начинает
        // выделяться весь текст на странице. Причину найти не удалось, сценарий описан в ошибке:
        // https://online.sbis.ru/opendoc.html?guid=bc6d9da2-ea28-4b5d-80e1-276c3d4a0cc7
        //
        // Другие браузеры (Chrome) при клике на элементы с user-select: none такое событие не стреляют.
        // В Edge подписываемся на selectstart на фазе захвата, и если target'ом является элемент с
        // user-select: none, отменяем начало выделения через preventDefault
        if (
            detection.isIE12 &&
            typeof window !== 'undefined' &&
            typeof document !== 'undefined'
        ) {
            // Проверяем _patchedSelectStart, так как этот обработчик уже могли повесить из core-init
            // (если на странице одновременно и старые и новые компоненты)
            if (!(window as any)._patchedSelectStart) {
                (window as any)._patchedSelectStart = true;
                document.body.addEventListener(
                    'selectstart',
                    (e) => {
                        const styles = getComputedStyle(e.target as Element);
                        const userSelect =
                            styles.getPropertyValue('-ms-user-select') ||
                            styles.getPropertyValue('user-select');
                        if (userSelect === 'none') {
                            e.preventDefault();
                        }
                    },
                    true
                );
            }
        }
    }
    //# endregion

    //# region регистрация событий
    setEventHook(
        events: TTemplateEventObject,
        element: TElement | Control,
        control: Control
    ): void {
        const domElement: HTMLElement = element?._container || element;
        if (!(domElement instanceof Element)) {
            return;
        }
        const eventsMeta = { ...events.meta };
        delete events.meta;
        Object.defineProperty(events, 'meta', {
            configurable: true,
            value: eventsMeta,
        });
        prepareEvents(events, element, control);
        if (!this.haveEvents(events)) {
            return;
        }
        if (!domElement) {
            this.clearInputValue(domElement);
        }
    }

    private isInputElement(element: HTMLElement): element is HTMLInputElement {
        return inputTagNames.has(element.tagName);
    }

    private clearInputValue(element: HTMLElement & { value?: unknown }): void {
        if (element && this.isInputElement(element)) {
            delete element.value;
        }
    }

    private haveEvents(events: Record<string, unknown>): boolean {
        return events && Object.keys(events).length > 0;
    }
    //# endregion

    //# region удаление событий

    private removeAllCaptureHandlers(): void {
        if (
            !this._rootDOMNode.parentNode ||
            (this.dontUseParentOnRoot && !this._rootDOMNode)
        ) {
            return;
        }
        for (const eventListenersRemover of this.eventListenersRemovers) {
            eventListenersRemover();
        }
    }

    //# endregion

    destroy(): void {
        this.removeAllCaptureHandlers();
    }

    private static eventSystem: WasabyEventsReact;

    static initInstance(rootDOM?: TModifyHTMLNode): WasabyEventsReact {
        if (
            !initializedEventSystem.size ||
            !initializedEventSystem.get(rootDOM)
        ) {
            const root = rootDOM || document.body;
            initializedEventSystem.set(rootDOM, new WasabyEventsReact(root));
        }
        return initializedEventSystem.get(rootDOM);
    }

    static destroyInstance(rootDOM: HTMLElement): void {
        if (
            initializedEventSystem.size &&
            initializedEventSystem.get(rootDOM)
        ) {
            initializedEventSystem.get(rootDOM).destroy();
            initializedEventSystem.delete(rootDOM);
        }
    }

    static getInstance(node: HTMLElement): WasabyEventsReact {
        if (!initializedEventSystem.size) {
            // @TODO https://online.sbis.ru/opendoc.html?guid=717ddcf1-6df5-44ee-93eb-e3edbfa5a57b
            // пока Controls не актуализируют unit-тесты, сообщаем об ошибке только в браузере
            if (constants.isBrowserPlatform) {
                Logger.error(
                    'Система событий не инициализирована. События работать не будут.'
                );
            }
            return;
        }
        let eventSystem = null;
        initializedEventSystem.forEach((value, key) => {
            if (key.contains(node)) {
                eventSystem = value;
            }
        });
        // берем значенеи по-умолчанию, для работы _notify из _beforeUnmount;
        return eventSystem || initializedEventSystem.values().next().value;
    }

    static mergeEvents(
        currentEvents: TEventObject,
        newEvents: TEventObject
    ): TEventObject {
        const mergedEvents = currentEvents;
        const newEventsKeys = Object.keys(newEvents);

        for (const key of newEventsKeys) {
            if (!currentEvents.hasOwnProperty(key)) {
                mergedEvents[key] = newEvents[key];
            }
        }

        let eventsMeta;
        if (
            currentEvents &&
            currentEvents.meta &&
            Object.keys(currentEvents.meta).length
        ) {
            eventsMeta = { ...currentEvents.meta };
        }
        if (newEvents && newEvents.meta && Object.keys(newEvents.meta).length) {
            eventsMeta = { ...newEvents.meta };
        }
        Object.defineProperty(mergedEvents, 'meta', {
            configurable: true,
            value: eventsMeta,
        });
        return mergedEvents;
    }
}
