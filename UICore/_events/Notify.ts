/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import { Control } from 'UICore/Base';
import { default as WasabyEvents } from './WasabyEvents';
import { isCustomEvent } from './DetectCustomEvent';
import { wasabyEventIntersection } from './ReactEventList';
import { Logger } from 'UICommon/Utils';
import { SyntheticEvent, IEventConfig } from 'UICommon/Events';

export type TCustomEvent = CustomEvent & {
    result?: unknown;
    createEvent?: Function;
};

function getControlElement(inst: any, eventName: string): HTMLElement | void {
    if (!inst._container) {
        const errorName =
            inst._moduleName === 'Controls/Container/Async'
                ? 'Async: ' + inst.currentTemplateName
                : inst._moduleName;
        Logger.error(
            `Контрол ${errorName} не был смонтирован в DOM-дерево. _notify события ${eventName} не будет запущен.
        Возможные причины проблемы:
        - через реакт не прокинут реф до корневого HTML элемента. Если так, выше в консоли есть более подробная ошибка по этому поводу.
        - _notify вызван до маунта или после анмаунта. Такое не поддерживается.`,
            inst
        );
        return;
    }
    return inst._container;
}

function isNameIntersection(eventName: string, inst: Control): boolean {
    if (wasabyEventIntersection['on:' + eventName]) {
        Logger.error(
            `Вызван _notify события "${eventName}" имя которого пересекается с нативным. Во избежании проблем следует переименовать событие.`,
            inst
        );
        return true;
    }
    return false;
}

/**
 * запускает нотифай события (для wasabyOverReact)
 * @param inst
 * @param eventName
 * @param args
 * @param options
 * @returns {unknown}
 */
export function callNotify<T extends Control>(
    inst: T /*  & {eventTarget: HTMLElement}, */,
    eventName: string,
    args?: unknown[] & { __initiator?: Control },
    options?: { bubbling?: boolean }
): unknown {
    const _eventName = eventName;
    if (isNameIntersection(_eventName, inst)) {
        return;
    }
    const eventSystem = WasabyEvents.getInstance((inst as any)._container);
    if (!eventSystem) {
        Logger.error('Система событий не инициализирована. События работать не будут.', inst);
        return;
    }
    // TODO: надо считать аргументы по старому, т.е. событие, шаблон, прочие
    Array.prototype.splice.call(arguments, 0, 1);
    const controlElement = getControlElement(inst, eventName);
    if (controlElement) {
        // return eventSystem.startEvent(controlNode, arguments);
        const eventConfig = {
            _bubbling: !!options?.bubbling,
            type: eventName,
            target: controlElement,
        };
        const [eventObject, finalArgs] = calculateEventArgs(args, eventConfig);
        finalArgs.control = inst;
        finalArgs.element = controlElement;
        finalArgs.type = eventName;
        let result;

        const generateEventObject = (): TCustomEvent => {
            return new CustomEvent(_eventName, {
                detail: finalArgs,
                bubbles: !!(options === null || options === void 0 ? void 0 : options.bubbling),
            });
        };
        const event = generateEventObject();
        event.createEvent = generateEventObject;
        eventObject.nativeEvent = event;
        controlElement.dispatchEvent(event);
        // todo временное решение для задачи https://online.sbis.ru/opendoc.html?guid=c344a854-1e2b-4890-8795-2563bd8a14f5&client=3
        //  мне нужно возвращать результат для обработчиков которые я вешаю напрямую на элемент, но это кастомные
        //  события из васаби которые мне надо ловить и обрабатывать в реакте, а другое решение навешивания обработчиков не готово
        // @ts-ignore
        result = event.resultValue;

        // ищем обработчик всплывающего события в контексте, он может оказаться там в случае
        // когда нотифай сделали из ребенка над которым реакт, обернутый в EventSubscriber
        const reactEventName = 'on' + eventName.charAt(0).toLocaleUpperCase() + eventName.slice(1);
        // проверяем на остновку не у самого события, а у синтетического, т.к. остановка происходит там
        if (
            options?.bubbling &&
            inst.context?.bubblingEvents?.[reactEventName] &&
            !event.detail[0].isStopped()
        ) {
            const handlers = inst.context.bubblingEvents[reactEventName];
            for (const handler of handlers) {
                // всплытие могут остановить в любом обработчике из EventSubscriber
                if (event.detail[0].isStopped()) {
                    break;
                }
                result = handler(...finalArgs);
            }
        }

        // условие на совместимость с ws3
        if ((inst as any).hasCompatible?.()) {
            finalArgs.eventName = eventName;
            finalArgs.originArgs = args;
            if (args && args.indexOf('__initiator') > -1) {
                finalArgs.control = args.__initiator;
            }

            let parent = controlElement.parentElement;
            let current = controlElement;
            while (parent && !eventObject.isStopped()) {
                // TODO: разобраться почему события активации в ws3-окнах приводили к закрытию окна
                const compatibleNotifier: any = (current as any).compatibleNotifier;
                if (
                    compatibleNotifier &&
                    controlElement !== current &&
                    _eventName !== 'onactivate'
                ) {
                    result = compatibleNotifier.notifyVdomEvent(eventObject.type, args, inst);
                }
                result = result || event.result || eventObject.result;
                current = parent;
                parent = parent.parentElement;
            }
        }
        return result || event.result;
    }
    // ругаемся ошибкой только для чистых wasaby контролов
    if (!(inst as any)['[Core/Abstract.compatible]']) {
        Logger.error(`[WasabyEvents] Не удалось запустить _notify события ${eventName}`, inst);
    }
}

export function getArgs<T>(e: any, ..._: unknown[]): T {
    if (e?.length > 0 && isCustomEvent(e[0])) {
        return e[0].detail;
    }
    if (isCustomEvent(e)) {
        return e.detail;
    }
    if (!(e instanceof SyntheticEvent)) {
        return [null, arguments] as unknown as T;
    }
    return arguments as unknown as T;
}

/*
 * private
 */
export function notifyFromReact<T>(
    element: T /*  & {eventTarget: HTMLElement}, */,
    eventName: string,
    args?: unknown[],
    bubbling?: boolean
): unknown {
    if (!element) {
        return;
    }
    const _eventName = eventName;
    const _element: HTMLElement = (element as any)?._container || (element as any);
    const eventConfig = {
        _bubbling: !!bubbling,
        type: _eventName,
        target: _element,
    };
    const [_, finalArgs] = calculateEventArgs(args, eventConfig);
    finalArgs.fromReact = true;
    const event: CustomEvent & { result?: unknown } = new CustomEvent(_eventName, {
        detail: finalArgs,
        bubbles: !!bubbling,
    });
    _element.dispatchEvent(event);
    return event.result;
}

type TArgs = unknown[];
interface IFinalArgs extends TArgs {
    fromReact?: boolean;
    control?: Control;
    element?: HTMLElement;
    type?: string;
    eventName?: string;
    originArgs?: TArgs;
}

function calculateEventArgs(
    args: unknown[] | undefined,
    eventConfig: IEventConfig
): [SyntheticEvent, IFinalArgs] {
    // первый аргумент может быть объектом-события при вызове из react,
    // если тип события из аргументов и наш совподают, то надо оставить одно из них
    // отдаем предпочтение тому, что в аргментах, т.к. могут ожидать определенный target
    if (
        args &&
        args.length &&
        args[0] instanceof SyntheticEvent &&
        args[0].type === eventConfig.type
    ) {
        return [args[0], args];
    }
    const eventObject = new SyntheticEvent(null as unknown as Event, eventConfig);
    const finalArgs = [eventObject];
    // в совместимости в notify могут передать не массив, а значение, раньше это работало, поэтому следует поддержать
    // TODO: надо ли выводить предупреждение или ошибку в таком случае?
    if (!(args instanceof Array)) {
        args = [args];
    }
    Array.prototype.push.apply(finalArgs, args);
    return [eventObject, finalArgs];
}
