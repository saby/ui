import type {
    TWasabyEvent,
    TEventObject,
    TReactEvent,
    TWasabyBind,
    TTemplateEventObject,
    ITemplateEventBase,
    ITemplateBindEvent,
    TEventHandler,
} from 'UICommon/Events';
import type { Control } from 'UICore/Base';

import { EventUtils } from 'UICommon/Events';
import { isCustomEvent } from './DetectCustomEvent';

const dontRegister = ['selectstart'];

export const REACT_FAKE_CONTROL = {
    _destroyed: false,
    _mounted: true,
    _moduleName: 'native React component',
    UNSAFE_isReact: true,
};

const notifyEvents = new Map();
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
    return fn;
}

function prepareBind(
    event: ITemplateBindEvent,
    element,
    eventName
): TWasabyBind {
    const ev = function (eventObj, value: string): void {
        if (isCustomEvent(eventObj)) {
            value = eventObj.detail[1];

            const args = arguments[0].detail;
            const eventContext = this.viewController;
            const eventHandlers = getEventHandlers(
                args.controlNode,
                eventObj.type,
                eventObj.target
            );
            if (
                eventHandlers.blockHandlers.length &&
                eventHandlers.blockHandlers.indexOf(event) > -1
            ) {
                return;
            }
            if (eventContext === args.control) {
                return;
            }
            if (eventContext._unmounted) {
                return;
            }
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
    addListener(event, element, eventName, bindFn(ev, event));

    event.fn = ev;
    bindEvent(event);
    return event as TWasabyBind;
}

function prepareNativeReact(event, element, eventName): TReactEvent {
    const ev = event;
    addListener(event, element, eventName, bindFn(ev, event));
    event.fn = ev;
    event.viewController = REACT_FAKE_CONTROL;
    bindEvent(event);
    return event;
}

function prepareWasabyEvent(
    event: ITemplateEventBase,
    metaContex: Function,
    metaHandler: TEventHandler,
    element,
    eventName
): TWasabyEvent {
    const ev = function (eventObj: CustomEvent): void {
        let args = arguments;
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

        args = arguments[0].detail;
        // processing - события которы создает сама система событий (longtap/swipe)
        if (args.isProcessing) {
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
        // fromReact - события которы создали в чистом реакте
        if (args.fromReact) {
            const res = handler.apply(eventContext, args);
            if (res !== undefined) {
                eventObj.result = res;
            }
            return;
        }

        const eventHandlers = getEventHandlers(
            args.controlNode,
            eventObj.type,
            event.value +
                '$' +
                eventContext._moduleName +
                '$' +
                eventContext._instId
        );
        if (
            eventHandlers.blockHandlers.length &&
            eventHandlers.blockHandlers.indexOf(event) > -1
        ) {
            return;
        }
        if (eventContext === args.control) {
            return;
        }
        if (eventContext._unmounted) {
            return;
        }
        const getAttributes = (args) => {
            let _args = args;
            if (isCustomEvent(eventObj)) {
                // добавим атрибуты из шаблона, это надо для нотифая с баблингом,
                // т.к. каждый обработчик, который подписан на событие может иметь свои аргументы или не иметь их
                if (event.args) {
                    _args = [...args];
                    _args.splice(1, 0, ...event.args);
                }
            }
            return _args;
        };
        const res = handler.apply(eventContext, getAttributes(args));
        if (res !== undefined) {
            eventObj.result = res;
        }
    };
    addListener(event, element, eventName, bindFn(ev, event));
    event.fn = ev;
    bindEvent(event);
    return event as TWasabyEvent;
}

function getElementToSubscribe(element): Element {
    return element.nodeName === 'INVISIBLE-NODE' ? element.parentNode : element;
}

function getEventKey(event): string {
    return event.value
        ? event.value +
              '$' +
              event.viewController._moduleName +
              '$' +
              event.viewController._instId
        : event.toString();
}

function clearNotifyListeners(bindedFn, key, clearHandler) {
    setTimeout(() => {
        // for of Map компилируется не правильно, надо делать явное преобразование
        for (const event of Array.from(notifyEvents.entries())) {
            if (!document.body.contains(event[0])) {
                notifyEvents.delete(event[0]);
            }
        }
    }, 0);
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

function addListener(event, element, eventName, bindedFn) {
    const name = eventName.slice(3).toLowerCase();
    if (dontRegister.indexOf(name) > -1) {
        return;
    }
    const elementToSubscribe = getElementToSubscribe(element);
    const callbackFn = (e) => {
        const hasInMap = notifyEvents.get(e.target)?.get(e.type)?.[
            getEventKey(event)
        ];
        if (hasInMap) {
            if (hasInMap.lock) {
                hasInMap.lock = false;
                return;
            } else {
                hasInMap.lock = true;
            }
        }
        bindedFn(e);
        if (hasInMap) {
            hasInMap.lock = false;
        }
    };
    elementToSubscribe.addEventListener(name, callbackFn, false);

    mapWorker(event, element, eventName, callbackFn);
}

function mapWorker(event, element, eventName, callbackFn) {
    const name = eventName.slice(3).toLowerCase();

    // отписку надо делать через замыкание чтобы удалялись не нудные подписки, а не актуальные
    const removeListener = () => {
        getElementToSubscribe(element).removeEventListener(
            name,
            callbackFn,
            false
        );
    };

    const removeFnOnUnmount = function () {
        removeListener();
        const inMap = notifyEvents.get(element);
        if (inMap) {
            inMap.delete(name);
            if (!notifyEvents.get(element).size) {
                notifyEvents.delete(element);
            }
        }
    };

    const key = getEventKey(event);
    const _notifyEvent = notifyEvents.get(element);
    removeFnOnUnmount.key = key;

    if (_notifyEvent) {
        const curFn = _notifyEvent.get(name);
        if (curFn) {
            // удаляем старый листенер и добавляем новый
            curFn[key]?.removeListener();
            curFn[key] = { removeListener, event };
            _notifyEvent.set(name, curFn);
        } else {
            _notifyEvent.set(name, { [key]: { removeListener, event } });
        }
        notifyEvents.set(element, _notifyEvent);
    } else {
        const mapByName = new Map();
        mapByName.set(name, { [key]: { removeListener, event } });
        notifyEvents.set(element, mapByName);
    }
    clearNotifyListeners(callbackFn, key, removeFnOnUnmount);
}

/**
 * Метод мутирует events для оптимизации производительности
 */
export function prepareEvents(
    events: TTemplateEventObject,
    element,
    control?: Control
): TEventObject {
    for (const eventName of Object.keys(events)) {
        const eventArr = events[eventName];
        for (const event of eventArr) {
            // КОСТЫЛЬ для Markup/Decorator
            // обсуждение тут https://online.sbis.ru/opendoc.html?guid=0ded1bc8-6886-4669-a6f8-816537207099
            // если задан isControlEvent = false значит событие уже настроено,
            // например Markup/Decorator создал такое событие
            // @ts-ignore
            if (event.fn?.isControlEvent === false) {
                continue;
            }

            if (isBindValue(event)) {
                prepareBind(event, element, eventName);
                continue;
            }
            if (isNativeCallback(event)) {
                prepareNativeReact(event, element, eventName);
                continue;
            }
            prepareWasabyEvent(
                event,
                events.meta.context,
                events.meta.handler,
                element,
                eventName
            );
        }
    }
    return events as TEventObject;
}

function getEventHandlers(controlNode, eventName, compatibleElement) {
    const controlNodes =
        compatibleElement?.controlNodes || controlNode.element.controlNodes;
    const result = { okHandlers: [], blockHandlers: [] };

    const hasElement = notifyEvents.get(controlNode.element);
    if (!hasElement) {
        return result;
    }
    const hasEvents = hasElement.get(eventName);
    if (!hasEvents) {
        return result;
    }
    const startControlNodeIndex = controlNodes.findIndex(function (cn) {
        return cn.control === controlNode.control;
    });
    const eventProps = [];
    for (const i of Object.keys(hasEvents)) {
        eventProps.push(hasEvents[i].event);
    }
    const foundHandlers = eventProps.map(function (eventHandler) {
        const foundIndex = controlNodes.findIndex(function (_controlNode) {
            return _controlNode.control === eventHandler.fn.control;
        });
        return {
            index: foundIndex,
            eventHandler,
        };
    });
    const okHandlers = [];
    const blockHandlers = [];
    foundHandlers.forEach(function (handler) {
        if (handler.index === -1 || handler.index > startControlNodeIndex) {
            okHandlers.push(handler.eventHandler);
        } else {
            blockHandlers.push(handler.eventHandler);
        }
    });
    return { okHandlers, blockHandlers };
}

// приводим названия событий к тому виду, который ожидает система событий
// мутирует events
export function resolveEventName(events) {
    if (typeof events !== 'object' || events === null) {
        return;
    }
    Object.keys(events).forEach((eventName) => {
        const lowerEventName = eventName.toLowerCase();
        if (eventName !== lowerEventName) {
            events[lowerEventName] = events[eventName];
            delete events[eventName];
        }
    });
    return events;
}
