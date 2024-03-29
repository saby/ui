import { cookie } from 'Application/Env';
import { Attr } from 'UICommon/Executor';
import { TTemplateEventObject } from 'UICore/Events';
import type { IControlConfig } from './interfaces';

/**
 * Добавление специальных атрибутов data-qa для автотестов.
 * Атрибуты добавляются только с кукой bindToAttribute
 */
export function addDataQaEventAttributes(
    attributes: Attr.IAttributes,
    events: TTemplateEventObject,
    config: IControlConfig
): void {
    if (!isBindToAttribute()) {
        return;
    }

    if (!events && !config?.attr?.events) {
        return;
    }

    let fullEvents = {};
    if (config?.attr?.events && config.mergeType === 'attribute') {
        fullEvents = Attr.mergeEvents(config.attr.events, events);
    } else {
        fullEvents = events;
    }

    for (const eventName of Object.keys(fullEvents)) {
        if (!eventName.startsWith('on:')) {
            // это может быть не событие, а специальный объект meta - общий объект для всех событий - его пропускаем.
            // чтобы не дублировать код в каждом конкретном событии
            // добавлялся тут для оптимизации https://online.sbis.ru/doc/fc981368-3c65-4230-b6d9-5c4b0db64dc1
            continue;
        }
        for (const eventHandler of fullEvents[eventName]) {
            if (eventHandler.hasOwnProperty('data')) {
                const attrName = eventName.replace('on:', 'data-qa-');
                attributes[attrName] =
                    attributes[attrName] || eventHandler.bindValue;
            }
        }
    }
}

const isServerSide = typeof window === 'undefined';
let bindToAttribute: undefined | boolean = undefined;
function isBindToAttribute(): boolean {
    if (isServerSide) {
        return cookie.get('bindToAttribute') === 'true';
    }
    if (bindToAttribute !== undefined) {
        return bindToAttribute;
    }
    bindToAttribute = cookie.get('bindToAttribute') === 'true';
    return bindToAttribute;
}
