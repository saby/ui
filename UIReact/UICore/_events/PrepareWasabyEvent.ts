import type {
    TWasabyEvent,
    TEventObject,
    TReactEvent,
    TWasabyBind,
    TTemplateEventObject,
    ITemplateEventBase,
    ITemplateBindEvent,
    TEventHandler,
    SyntheticEvent,
} from 'UICommon/Events';
import type { Control } from 'UICore/Base';

import { EventUtils } from 'UICommon/Events';
import { Logger } from 'UICommon/Utils';
import { isCustomEvent } from './DetectCustomEvent';

const dontRegister = ['selectstart'];

export const REACT_FAKE_CONTROL = {
    _destroyed: false,
    _mounted: true,
    _moduleName: 'native React component',
    UNSAFE_isReact: true,
};

type TCallbackFn = (e) => void;

function isNativeCallback(event): event is TReactEvent {
    return event instanceof Function;
}

function isBindValue(event): event is ITemplateBindEvent {
    return 'bindValue' in event;
}

function bindEvent(event): void {
    event.fn = event.fn.bind({
        viewController: event.viewController,
        data: event.data,
    });
    event.fn.control = event.viewController;
}

function bindFn(fn, event) {
    fn = fn.bind({
        viewController: event.viewController,
        data: event.data,
    });
    fn.control = event.viewController;
    if (event.saveWasabyEventObject) {
        fn.saveWasabyEventObject = event.saveWasabyEventObject;
    }
    return fn;
}

function prepareBind(event: ITemplateBindEvent, element, eventName, control: Control): TWasabyBind {
    const ev = function (eventObj, value: string): void {
        const args: unknown[] = [...(arguments as unknown as unknown[])];
        const _control = args.pop();
        const controlElement = args.pop() as HTMLElement;
        const eventContext = this.viewController;
        const _fromReact = args.pop();
        const _isProcessing = args.pop();

        const eventHandlers = getEventHandlers(_control, controlElement, eventObj.type);
        if (
            eventHandlers.blockHandlers.length &&
            eventHandlers.blockHandlers.indexOf(event) > -1 &&
            (!eventObj.isBubbling() ||
                (eventObj.isBubbling() &&
                    eventObj.nativeEvent.target === eventObj.nativeEvent.currentTarget))
        ) {
            return;
        }
        if (eventContext._unmounted || eventContext._destroyed) {
            return;
        }
        EventUtils.checkBindValue(event, event.bindValue);
        if (this.viewController === REACT_FAKE_CONTROL) {
            event.handler(this.data, value);
            return;
        }
        if (!event.handler(this.viewController, value)) {
            event.handler(this.data, value);
        }
    };
    addListener(event, element, eventName, bindFn(ev, event), control);

    event.fn = ev;
    bindEvent(event);
    return event as TWasabyBind;
}

function prepareNativeReact(
    handler: Function,
    element: HTMLElement,
    eventName: string,
    control: Control
): void {
    addListener({}, element, eventName, handler, control);
}

function prepareWasabyEvent(
    event: ITemplateEventBase,
    metaContex: Function,
    metaHandler: TEventHandler,
    element,
    eventName,
    control: Control
): TWasabyEvent {
    const ev = function (eventObj: SyntheticEvent): void {
        let args: unknown[] = [...(arguments as unknown as unknown[])];
        const control = args.pop() as Control;
        const element = args.pop() as HTMLElement;
        const fromReact = args.pop();
        const isProcessing = args.pop();

        const preparedContext = event.context || metaContex;
        const eventContext = preparedContext.apply(this.viewController);
        const handler = event.handler
            ? event.handler.apply(this.viewController)
            : metaHandler.apply(this.viewController, [event.value]);
        if (typeof handler === 'undefined') {
            throw new Error(
                `Отсутствует обработчик ${event.value} события ${eventObj.type}` +
                    ` у контрола ${event.viewController._moduleName}`
            );
        }
        if (isCustomEvent(eventObj)) {
            args = arguments[0].detail;
        }
        // processing - события которы создает сама система событий (longtap/swipe)
        if (isProcessing) {
            const getAttributes = (args) => {
                let _args = [args.syntheticEvent];
                if (event.args) {
                    _args = [args.syntheticEvent, ...event.args];
                }
                return _args;
            };
            const res = handler.apply(eventContext, getAttributes(args));
            if (res !== undefined) {
                eventObj.result = res;
            }
            return;
        }
        const getAttributes = (args) => {
            let _args = args;
            // добавим атрибуты из шаблона, это надо для нотифая с баблингом,
            // т.к. каждый обработчик, который подписан на событие может иметь свои аргументы или не иметь их
            if (event.args) {
                _args = [...args];
                _args.splice(1, 0, ...event.args);
            }
            return _args;
        };
        // fromReact - события которы создали в чистом реакте
        if (fromReact) {
            const res = handler.apply(eventContext, getAttributes(args));
            if (res !== undefined) {
                eventObj.result = res;
            }
            return;
        }
        const eventHandlers = getEventHandlers(control, element, eventObj.type);
        if (
            eventHandlers.blockHandlers.length &&
            eventHandlers.blockHandlers.indexOf(event) > -1 &&
            (!eventObj.isBubbling() ||
                (eventObj.isBubbling() &&
                    eventObj.nativeEvent.target === eventObj.nativeEvent.currentTarget))
        ) {
            return;
        }
        if (eventContext._unmounted || eventContext._destroyed) {
            return;
        }
        const res = handler.apply(eventContext, getAttributes(args));
        if (res !== undefined) {
            return res;
        }
    };
    addListener(event, element, eventName, bindFn(ev, event), event.viewController || control);
    event.fn = ev;
    bindEvent(event);
    return event as TWasabyEvent;
}

function getElementToSubscribe(element): Element {
    return element.nodeName === 'INVISIBLE-NODE' ? element.parentNode : element;
}

function getEventKey(event): string {
    return event.value
        ? event.value + '$' + event.viewController._moduleName + '$' + event.viewController._instId
        : event.toString();
}

function getNumberId(id: string | 0): number {
    return parseInt((id + '').replace('inst_', ''), 10);
}

function clearNotifyListeners(bindedFn, key, clearHandler, notifyEvents) {
    // Может быть ситуация когда контрол только обновляется, и постоянно регистрирует новые события в мапе
    // это держит за собой весь DOM через ссылки на controlNodes
    // надо очищать мапу от ссылок на старый DOM
    for (const el of notifyEvents.keys()) {
        if (!el.parentNode || !el.parentNode.parentNode) {
            notifyEvents.delete(el);
        }
    }
    if (bindedFn.control && bindedFn.control !== REACT_FAKE_CONTROL) {
        const existHandlers = [];
        for (const handler of bindedFn.control._$needRemoveBeforeUnmount) {
            existHandlers.push(handler.key);
        }
        if (existHandlers.indexOf(key) === -1) {
            bindedFn.control._$needRemoveBeforeUnmount.push(clearHandler);
        }
    }
}

function eventNameResolver(event, eventName) {
    if (!event?.originalName) {
        return eventName.slice(3);
    }
    const originalName = event.originalName;
    if (originalName.includes('bind:')) {
        return event.value;
    }
    return originalName;
}

function addListener(event, element, eventName, bindedFn, control) {
    const name = eventNameResolver(event, eventName);
    if (dontRegister.indexOf(name) > -1) {
        return;
    }
    const elementToSubscribe = getElementToSubscribe(element);
    const callbackFn = (e) => {
        // возможна крайне редкая ситуация на очень медленных тачках событие стреляет после очистки контрола
        // в таком случае смысла от вызова события нет, поэтому чтобы не падала ошибка просто выйдем из обработчика
        if (control.__purified) {
            return;
        }
        const wasFired = control._$firedNotifyEvents;
        if (wasFired.has(e)) {
            return;
        }
        wasFired.add(e);
        const args: unknown[] = getArgs(e);
        let result;
        if (
            !bindedFn.saveWasabyEventObject &&
            (!bindedFn.control || bindedFn.control._moduleName === 'native React component')
        ) {
            const finalArgs = bindedFn.isWasabyEventCallback ? args : args.slice(1);
            result = bindedFn(...finalArgs);
        } else {
            if (
                e.type === event?.originalName?.toLowerCase() &&
                e.detail.control &&
                e.detail.type !== event.originalName
            ) {
                Logger.error(
                    `Ошибка вызова _notify! Вызван _notify("${e.detail.type}"), подписка была добавлена на событие ${event.originalName}. Следует переименовать подписку в шаблоне.
                Ошибки можно прикреплять к проекту https://online.sbis.ru/opendoc.html?guid=77a7948d-c34d-4313-a5a9-aebdb0bb352a&client=3`,
                    e.detail.control._logicParent
                );
            }
            let _control = args.control;
            let _target = args.element;
            if (e.bubbles && args.element !== e.currentTarget) {
                _control = bindedFn.control;
                _target = e.currentTarget;
            }
            // @ts-ignore
            result = bindedFn(...args, args.isProcessing, args.fromReact, _target, _control);
        }
        if (result !== undefined) {
            e.result = result;
        }
        // чистить надо, т.к. если не чистим то ломается активация с хоков
        wasFired.delete(e);
    };
    elementToSubscribe.addEventListener(name, callbackFn, false);

    mapWorker(event, elementToSubscribe, name, callbackFn, control);
}

function mapWorker(
    event,
    element: Element,
    eventName: string,
    callbackFn: TCallbackFn,
    control: Control
) {
    // отписку надо делать через замыкание чтобы удалялись не нужные подписки, а не актуальные
    const removeListener = () => {
        getElementToSubscribe(element).removeEventListener(eventName, callbackFn, false);
    };

    const removeFnOnUnmount = function () {
        removeListener();
        const inMap = control._$notifyEvents.get(element);
        if (inMap) {
            inMap.delete(eventName);
            if (!control._$notifyEvents.get(element).size) {
                control._$notifyEvents.delete(element);
            }
        }
    };

    const key = getEventKey(event);
    const _notifyEvent = control._$notifyEvents.get(element);
    removeFnOnUnmount.key = key;

    if (_notifyEvent) {
        const curFn = _notifyEvent.get(eventName);
        if (curFn) {
            // удаляем старый листенер и добавляем новый
            curFn[key]?.removeListener();
            curFn[key] = { removeListener, event };
            _notifyEvent.set(eventName, curFn);
        } else {
            _notifyEvent.set(eventName, {
                [key]: { removeListener, event },
            });
        }
        control._$notifyEvents.set(element, _notifyEvent);
    } else {
        const mapByName = new Map();
        mapByName.set(eventName, { [key]: { removeListener, event } });
        control._$notifyEvents.set(element, mapByName);
    }
    clearNotifyListeners(callbackFn, key, removeFnOnUnmount, control._$notifyEvents);
}

/**
 * Метод мутирует events для оптимизации производительности
 */
export function prepareEvents(
    events: TTemplateEventObject,
    element,
    control: Control
): TEventObject {
    for (const eventName of Object.keys(events)) {
        const eventArr = events[eventName];
        for (const event of eventArr) {
            if (!event) {
                continue;
            }
            // КОСТЫЛЬ для Markup/Decorator
            // обсуждение тут https://online.sbis.ru/opendoc.html?guid=0ded1bc8-6886-4669-a6f8-816537207099
            // если задан isControlEvent = false значит событие уже настроено,
            // например Markup/Decorator создал такое событие
            // @ts-ignore
            if (event.fn?.isControlEvent === false) {
                continue;
            }

            if (isBindValue(event)) {
                prepareBind(event, element, eventName, control);
                continue;
            }
            if (isNativeCallback(event)) {
                prepareNativeReact(event, element, eventName, control);
                continue;
            }
            prepareWasabyEvent(
                event,
                events.meta.context,
                events.meta.handler,
                element,
                eventName,
                control
            );
        }
    }
    return events as TEventObject;
}

function getFromControlMapEvent(eventMap, element: HTMLElement, eventName: string) {
    const hasElement = eventMap.get(element);
    if (!hasElement) {
        return;
    }
    const hasEvents = hasElement.get(eventName);
    if (!hasEvents) {
        return;
    }
    return hasEvents;
}

function getEventHandlers(control: Control, controlElement: HTMLElement, eventName: string) {
    const result = { okHandlers: [], blockHandlers: [] };

    // @ts-ignore
    const controlNodes = controlElement.controlNodes;
    if (!controlNodes) {
        return result;
    }
    const hasEvents = {};
    for (const controlNode of controlNodes) {
        const controlEvent = getFromControlMapEvent(
            controlNode.control._$notifyEvents,
            controlElement,
            eventName
        );
        if (!controlEvent) {
            continue;
        }
        for (const _eventName in controlEvent) {
            if (controlEvent.hasOwnProperty(_eventName)) {
                hasEvents[_eventName] = controlEvent[_eventName];
            }
        }
    }
    if (!Object.keys(hasEvents).length) {
        return result;
    }
    const startControlId = getNumberId(control._instId);
    const eventProps = [];
    for (const _eventName of Object.keys(hasEvents)) {
        // если [object Object] значит колбэк из реакта
        // его в массив добавлять не надо
        if (_eventName === '[object Object]') {
            continue;
        }
        eventProps.push(hasEvents[_eventName].event);
    }
    // controlNodes был отсортирован по убыванию числового значение _instId. Поэтому то же самое без controlNodes можно написать так:
    // 1. если корневой элемент другой, оставим -1. Было так же, findIndex в этом случае возвращал -1.
    // 2. если корневой элемент совпадает, вместо индекса в массиве вернём числовое значение id.
    // 3. инвертируем знак неравенства в условии добавления в okHandlers, потому что в controlNodes id убывал.
    const foundHandlers = eventProps.map(function (eventHandler) {
        const eventControl = eventHandler.fn.control;
        const foundIndex =
            eventControl._container === controlElement ? getNumberId(eventControl._instId) : -1;
        return {
            index: foundIndex,
            eventHandler,
        };
    });
    foundHandlers.forEach(function (handler) {
        if (handler.index === -1 || handler.index < startControlId) {
            result.okHandlers.push(handler.eventHandler);
        } else {
            result.blockHandlers.push(handler.eventHandler);
        }
    });
    return result;
}

// приводим названия событий к тому виду, который ожидает система событий
// мутирует events
export function resolveEventName(events) {
    if (typeof events !== 'object' || events === null) {
        return;
    }
    Object.keys(events).forEach((eventName) => {
        const lowerEventName = eventName;
        if (eventName !== lowerEventName) {
            events[lowerEventName] = events[eventName];
            delete events[eventName];
        }
    });
    return events;
}

function getArgs<T>(e, ..._): T {
    if (e?.length > 0 && isCustomEvent(e[0])) {
        return e[0].detail;
    }
    if (isCustomEvent(e)) {
        return e.detail;
    }
    return arguments as unknown as T;
}

/**
 * Проверка что колбэк является оберктой созданной системой событий, а не реальным колбэком
 * нужно в тех случаях, когда в коде проверяют есть ли в пропах фунция или нет
 * функция будет теперь всегда, но реагировать надо только на реальные колбэки
 * Если вернул функцию, значит это честный колбэк
 * @param fn - функция или undefined
 * @returns {Function | undefined}
 */
export function checkWasabyEvent(fn) {
    if (!fn) {
        return undefined;
    }
    if (fn.isWasabyEventCallback) {
        return undefined;
    }
    return fn;
}

/**
 * Преобразует onEventName в onEventname,
 * необходимо для проверки пересечения имен событий и колбэков
 * @param eventName
 * @returns {string}
 */
export function getOldReactEventName(eventName: string): string {
    return 'on' + eventName.charAt(2).toUpperCase() + eventName.slice(3).toLowerCase();
}
