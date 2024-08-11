/* eslint-disable */

import { Record } from 'Types/entity';
import { Logger } from 'UICommon/Utils';
import { constants } from 'Env/Env';

/**
 * Утилиты для работы с системой событий
 * @class UICommon/_events/EventUtils
 * @public
 */

const originDOMEventNames = {
    mozmousepixelscroll: 'MozMousePixelScroll',
    domautocomplete: 'DOMAutoComplete',
};

const passiveFalseEvents = ['wheel', 'mousewheel', 'touchstart', 'touchmove'];
const specialBodyEvents = ['scroll', 'resize'];

/**
 * Проверка атрибута что это подписка на событие (on:event)
 * @param titleAttribute
 * @returns {boolean}
 */
export function isEvent(titleAttribute) {
    return /^(on:[A-z0-9])\w*$/.test(titleAttribute);
}

/**
 * Получение имени события
 * @param eventAttribute
 * @returns {string}
 */
export function getEventName(eventAttribute) {
    return eventAttribute.slice(3);
}

/**
 * Начиная с 73.0.3683.56 версии хрома, обработчики на события wheel/mousewheel, зарегистрированные на документе
 * автоматически пометятся параметром passive(это значит, что preventDefault в них не будет работать).
 * Нас такое поведение не устраивает, так как есть кейсы, когда preventDefault вызывается и должен работать.
 * Эта функция возвращает true, если eventName - mousewheel или wheel.
 * @param eventName - имя события
 * @returns {boolean}
 */
export function checkPassiveFalseEvents(eventName): boolean {
    return passiveFalseEvents.indexOf(eventName) !== -1;
}

/**
 * Проверяем, входит ли событие в список событий, которые стреляют на window, а не на document'е
 * @param eventName - имя события
 * @returns {boolean}
 */
export function isSpecialBodyEvent(eventName): boolean {
    return specialBodyEvents.indexOf(eventName) !== -1;
}

/**
 * Исправление регистра в имени событий для из списка originDOMEventNames
 * @param name
 * @returns {boolean}
 */
export function fixUppercaseDOMEventName(name) {
    const fixedName = originDOMEventNames[name];
    return fixedName || name;
}

//TODO: https://online.sbis.ru/opendoc.html?guid=9f8133e8-5aaf-4b95-897f-00160c512daf
/**
 * Обработчик используется в шаблонах для проксирования событий логическому родителю.
 * @param event
 * @param eventName
 * @param args
 * returns {Function}
 */
export function tmplNotify(event: Event, eventName: string, ...args: unknown[]) {
    /**
     * We can't ignore bubbling events here, because no one guarantees they're the same.
     * E.g. on:myEvent="_tmplNotify('anotherEvent')"
     * Here, event gets forwarded but under a different name.
     */
    return this._notify(eventName, args);
}

/**
 * Транслирует переданные события модели от переданного контрола
 * @param component
 * @param model
 * @param eventNames
 * returns {void}
 */
export function proxyModelEvents(component, model, eventNames: string[]) {
    eventNames.forEach((eventName: string) => {
        model.subscribe(eventName, (event, value) => {
            component._notify(eventName, value);
        });
    });
}

/**
 * Используется в контролах для обработки события keyDown
 * @param event
 * @param keys
 * @param handlerSet
 * @param scope
 * @param dontStop
 * returns {void}
 */
export function keysHandler(event, keys, handlerSet, scope: object, dontStop: boolean): void {
    for (const action in keys) {
        if (keys.hasOwnProperty(action)) {
            /*
         В тестах для генерации событий у нас используется https://github.com/testing-library/user-event.

         event.keyCode - устаревшее поле, которое даже удалили из стандартов, поэтому в сгенерированных событиях его нет.
         Но слишком много кода завязано именно на него, так что просто удалить нельзя.

         event.code - рекомендуемая замена, но его нет в IE.

         Приходится смотреть на event.key и потихоньку переписывать места использования по мере переписывания тестов.
          */
            if (
                event.nativeEvent.keyCode === keys[action] ||
                event.nativeEvent.key === keys[action]
            ) {
                handlerSet[action](scope, event);

                // Так как наша система событий ловит события на стадии capture,
                // а подписки в БТРе на стадии bubbling, то не нужно звать stopPropagation
                // так как обработчики БТРа в таком случае не отработают, потому что
                // у события не будет bubbling фазы
                // TODO: will be fixed https://online.sbis.ru/opendoc.html?guid=cefa8cd9-6a81-47cf-b642-068f9b3898b7
                if (!dontStop) {
                    if (event.target.closest('.ws-dont-stop-native-event')) {
                        event._bubbling = false;
                    } else {
                        event.stopImmediatePropagation();
                    }
                }
                return;
            }
        }
    }
}

export function checkBindValue(event, value): boolean {
    if (constants.isProduction) {
        // эта проверка нужна только для упрощения дебага
        // в релизе только забирает миллисекунды на проверки
        return true;
    }

    const checkNested = (obj, propName, index) => {
        if (obj === undefined) {
            return false;
        }
        if (obj === null) {
            return true;
        }
        if (propName[index] in obj && propName.length === index + 1) {
            return true;
        }
        if (Array.isArray(obj[propName[index]])) {
            // могли сделать bind на массив внутри объекта, надо проверить что все поля совпадают
            let checkArray = [];
            for (let i = 0; i < obj[propName[index]].length; i++) {
                checkArray.push(checkNested(obj[propName[index]][i], propName, index + 1));
            }
            return checkArray.indexOf(false) <= -1;
        }
        if (obj[propName[index]] instanceof Record) {
            return true;
        }
        return checkNested(obj[propName[index]], propName, index + 1);
    };
    const wrongBind = (value: string): void => {
        Logger.warn(
            `Bind на несуществующее поле "${value}". Bind может работать не правильно`,
            event.viewController
        );
    };
    const checkRecord = (value: string): boolean => {
        const recordRe = /record\[(.*)\]/g;
        const matches = recordRe.exec(value);
        if (!matches) {
            return false;
        }
        // если bind сделан из контеной опции, то он может быть забинжен на опции родителя,
        // в таком случае мы не должны падать с ошибкой
        const record =
            value.indexOf('_options') === 0 ? event.data?._options?.record : event.data?.record;
        const cleanRecordName = matches[1].replace(/['"]/g, '');
        if (!(record instanceof Record)) {
            return false;
        }
        if (
            cleanRecordName.length === 0 ||
            (record instanceof Record && typeof record.get(cleanRecordName) === 'undefined')
        ) {
            wrongBind(value);
        }
        return true;
    };
    if (!value) {
        return false;
    }

    if (checkRecord(value)) {
        return true;
    }
    const ruNames = /[А-Яа-я]/g;
    if (ruNames.exec(value)) {
        return true;
    }
    const data = event.data;
    const valueArray = value.split('.');
    const re = /\[\s*\S*]/gi;
    for (const i in valueArray) {
        if (re.test(valueArray[i])) {
            valueArray[i] = valueArray[i].split(re)[0];
        }
    }
    if (!checkNested(data, valueArray, 0)) {
        wrongBind(value);
    }
    return true;
}
