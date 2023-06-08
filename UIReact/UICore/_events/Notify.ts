/**
 */
import { Control } from 'UICore/Base';
import { default as WasabyEvents } from './WasabyEvents';
import { isCustomEvent } from './DetectCustomEvent';
import { wasabyEventIntersection } from './ReactEventList';
import { Logger } from 'UICommon/Utils';
import { SyntheticEvent } from 'UICommon/Events';

function getControlNode(inst: Control<unknown, unknown>, eventName: string) {
    if (!inst._container) {
        const errorName =
            inst._moduleName === 'Controls/Container/Async'
                ? 'Async: ' + inst.currentTemplateName
                : inst._moduleName;
        Logger.error(
            `Контрол ${errorName} не был смонтирован в DOM-дерево. _notify события ${eventName} не будет запущен.
        Скорее всего ошибка связана с ref.
        Возможные причины проблемы:
        - если вы передаете в функциональный компонент ref, а этот функциональный компонент не является forwardRef, то ошибка скорее всего с этим компонентом.
        - передаете React-компонент в wasaby-контрол в виде контентной опции content. И этот React-компонент не прокидывает ref
        Подробнее в базе знаний: https://online.sbis.ru/page/knowledge-bases?baseId=babadcfb-cc27-4589-9b97-9200c2e399ee&article=ae49631c-1a0e-4908-90a2-cea13b7a78e1#toc_af5a6612-2c3c-4080-8bb6-91049514f4ed`,
            inst
        );
        return false;
    }
    const controlNodes =
        inst.controlNodesAfterUnmount || inst._container.controlNodes;
    const controlNodeForInst =
        controlNodes &&
        controlNodes.filter((node) => {
            return node.control === inst;
        });
    if (Array.isArray(controlNodeForInst)) {
        return controlNodeForInst[0];
    }
    return controlNodeForInst;
}

function isNameIntersection(eventName: string, inst): boolean {
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
export function callNotify<T extends Control<unknown, unknown>>(
    inst: T /*  & {eventTarget: HTMLElement}, */,
    eventName: string,
    args?: unknown[],
    options?: { bubbling?: boolean }
): unknown {
    const _eventName = eventName.toLowerCase();
    if (isNameIntersection(_eventName, inst)) {
        return;
    }
    const eventSystem = WasabyEvents.getInstance(inst._container);
    if (!eventSystem) {
        // @TODO https://online.sbis.ru/opendoc.html?guid=717ddcf1-6df5-44ee-93eb-e3edbfa5a57b
        // В unit-тестах Controls контролы создаются через new. Большинству тестов события были не нужны.
        // В инферно события инициализировались на окружении и в нужных тестах работали без дополнительно инициализации.
        // В React окружения нет. А систему событий инициализируем вручную в Control.createControl.
        // Чтобы не падали unit-тесты нужно звать _notify только если система событий явно инициализирована.
        return;
    }
    // TODO: надо считать аргументы по старому, т.е. событие, шаблон, прочие
    Array.prototype.splice.call(arguments, 0, 1);
    const controlNode = getControlNode(inst, eventName);
    if (controlNode) {
        // return eventSystem.startEvent(controlNode, arguments);
        const eventConfig = {
            _bubbling: !!options?.bubbling,
            type: _eventName,
            target: controlNode.element,
        };
        const eventObject = new SyntheticEvent(null, eventConfig);
        const finalArgs = [eventObject];
        // в совместимости в notify могут передать не массив, а значение, раньше это работало, поэтому следует поддержать
        // TODO: надо ли выводить предупреждение или ошибку в таком случае?
        if (!(args instanceof Array)) {
            args = [args];
        }
        Array.prototype.push.apply(finalArgs, args);

        finalArgs.control = controlNode.control;
        finalArgs.controlNode = controlNode;
        finalArgs.type = eventName;
        let result;

        const event = new CustomEvent(_eventName, {
            detail: finalArgs,
            bubbles: !!options?.bubbling,
        });
        eventObject.nativeEvent = event;
        controlNode.element.dispatchEvent(event);

        // условие на совместимость с ws3
        if (controlNode.control.hasCompatible?.()) {
            finalArgs.eventName = eventName;
            finalArgs.originArgs = args;
            if (args && args.indexOf('__initiator') > -1) {
                finalArgs.control = args.__initiator;
            }

            let parent = controlNode.element.parentElement;
            let current = controlNode.element;
            while (parent && !eventObject.isStopped()) {
                // TODO: разобраться почему события активации в ws3-окнах приводили к закрытию окна
                if (
                    current.compatibleNotifier &&
                    controlNode.element !== current &&
                    _eventName !== 'onactivate'
                ) {
                    result = current.compatibleNotifier.notifyVdomEvent(
                        eventObject.type,
                        args,
                        controlNode?.control
                    );
                }
                result = result || event.result || eventObject.result;
                current = parent;
                parent = parent.parentElement;
            }
        }
        return result || event.result;
    }
    // ругаемся ошибкой только для чистых wasaby контролов
    if (!inst['[Core/Abstract.compatible]']) {
        Logger.error(
            `[WasabyEvents] Не удалось запустить _notify события ${eventName}`,
            inst
        );
    }
}

export function getArgs<T>(e, ..._): T {
    if (e?.length > 0 && isCustomEvent(e[0])) {
        return e[0].detail;
    }
    if (isCustomEvent(e)) {
        return e.detail;
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
    bubbling?: boolean): unknown {
    const _eventName = eventName.toLowerCase();
    const _element = element._container || element;
    const eventConfig = {
        _bubbling: !!bubbling,
        type: _eventName,
        target: _element,
    };
    const eventObject = new SyntheticEvent(null, eventConfig);
    const finalArgs = [eventObject];
    Array.prototype.push.apply(finalArgs, args);
    finalArgs.fromReact = true;
    const event = new CustomEvent(_eventName, {
        detail: finalArgs,
        bubbles: !!bubbling,
    });
    _element.dispatchEvent(event);
    return event.result;
}
