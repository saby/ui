/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { Control } from 'UICore/Base';

// @ts-ignore
import template = require('wml!UICore/_hotKeys/KeyHook');
import { goUpByControlTree } from 'UICore/NodeCollector';
import Dispatcher from './Dispatcher';

/**
 * Создание события нажатия определенной клавиши
 */
function createEvent(key: string, sourceEvent: KeyboardEvent): object {
    let eventObj;
    if (document.createEventObject) {
        eventObj = document.createEventObject();
        eventObj.keyCode = key;

        eventObj.ctrlKey = sourceEvent.ctrlKey;
        eventObj.altKey = sourceEvent.altKey;
        eventObj.shiftKey = sourceEvent.shiftKey;
    } else if (document.createEvent) {
        eventObj = document.createEvent('Events');
        eventObj.initEvent('keydown', true, true);
        eventObj.which = key;
        eventObj.keyCode = key;
        eventObj.ctrlKey = sourceEvent.ctrlKey;
        eventObj.altKey = sourceEvent.altKey;
        eventObj.shiftKey = sourceEvent.shiftKey;
    }
    return eventObj;
}

/**
 * проверка элемента на видимость
 */
function isHidden(container: HTMLElement): boolean {
    return !container || !document.body.contains(container);
}

/**
 * Контрол KeyHook - контрол, который указывает клавиши, нажатие на которые будет обработано по умолчанию дочерним
 * контролом. Он регистрирует клавиши по умолчанию для всех предков, у которых еще нет зарегистрированного действия на
 * эту клавишу, и, в случае необработанного нажатия этих клавиш, в дочерний контрол будет перенаправлено событие о
 * нажатии на клавишу, и там будет обработано.
 * @extends UICore/Base:Control
 * @public
 */
class KeyHook extends Control {
    // набор действий по умолчанию, зарегистрированных на определенные клавиши
    private _actions: object = {};

    private _savedParents: object[] = [];

    _afterMount(): void {
        this.register();
    }
    _beforeUnmount(): void {
        this.unregister();
    }

    /**
     * Регистрация для дочернего контрола горячих клавиш, объявленных в опции defaultActions
     */
    register(): void {
        // опция defaultActions хранит набор клавиш, которые будут обработаны по умолчанию
        if (this._options.defaultActions) {
            // не регистрируем для скрытых контролов
            if (isHidden(this._container)) {
                return;
            }

            // регистрируем только в пределах попапа
            // todo придумать проверку получше
            // https://online.sbis.ru/opendoc.html?guid=50215de6-da5c-44bf-b6f6-a9f7cb0e17d2
            const wholeParents = goUpByControlTree(this._container);
            const popupIndex = wholeParents.findIndex((parent) => {
                return parent._moduleName === 'Controls/popupTemplateStrategy:Popup';
            });
            const keyHookIndex = wholeParents.findIndex((parent) => {
                return parent._moduleName === 'UICore/HotKeys:KeyHook';
            });
            const startIndex = keyHookIndex === -1 ? 0 : keyHookIndex;
            const endIndex = popupIndex === -1 ? wholeParents.length : popupIndex + 1;
            const parents = wholeParents.slice(startIndex, endIndex);

            this._savedParents = parents;

            // собираем всех предков, и говорим им, какое действие по умолчанию нужно выполнить на необработанное
            // нажатие клавиш
            this._options.defaultActions.forEach((action) => {
                let needStop = false;
                for (let i = 0; i < parents.length; i++) {
                    const parent = parents[i];
                    // если у контрола уже есть зарегистрированное действие по умолчанию на эту клавишу,
                    // перестаем регистрацию
                    if (parent._$defaultActions && parent._$defaultActions[action.keyCode]) {
                        needStop = true;
                        break;
                    }
                    // выше контрола Dispatcher не регистрируем. Dispatcher ограничивает область перехвата и
                    // регистрации действий по умолчанию.
                    if (parent.constructor === Dispatcher) {
                        needStop = true;
                        break;
                    }
                    this.registerAction(parent, action);
                }

                if (!needStop && popupIndex === -1) {
                    // todo костыль будет исправлен по проекту
                    //  https://online.sbis.ru/opendoc.html?guid=5450a3d5-b883-4fa1-9f51-7599a45981a3&client=3
                    this.registerAction(document.body, action);
                }
            });
        }
    }
    registerAction(obj, action) {
        obj._$defaultActions = obj._$defaultActions || {};

        // действием по умолчанию будет отправка события нажатия на клавишу по умолчанию,
        // это событие будет всплывать от контрола, обернутого в KeyHook.
        // таким образом мы как бы перенаправляем событие нажатия клавиши из места, где оно не
        // обработано - в место, где оно обрабатывается по умолчанию.
        this._actions[action.keyCode] = this._actions[action.keyCode] || {
            action: (sourceEvent: KeyboardEvent) => {
                const event = createEvent(action.keyCode, sourceEvent);
                this._container.dispatchEvent(event);
            },
        };

        obj._$defaultActions[action.keyCode] = this._actions[action.keyCode];
    }
    /**
     * Разрегистрация для дочернего контрола горячих клавиш, объявленных в опции defaultActions
     */
    unregister(): void {
        const parents = this._savedParents;
        this._savedParents = null;

        if (parents) {
            // при удалении контрола произведем разрегистрацию.
            if (this._options.defaultActions) {
                this._options.defaultActions.forEach((action) => {
                    let needStop = false;
                    for (let i = 0; i < parents.length; i++) {
                        const parent = parents[i];
                        if (this.unregisterAction(parent, action)) {
                            needStop = true;
                            break;
                        }
                    }

                    if (!needStop) {
                        // todo костыль будет исправлен по проекту
                        //  https://online.sbis.ru/opendoc.html?guid=5450a3d5-b883-4fa1-9f51-7599a45981a3&client=3
                        this.unregisterAction(document.body, action);
                    }
                });
            }
        }
    }
    unregisterAction(obj, action) {
        const curAction = this._actions[action.keyCode];
        if (obj._$defaultActions && obj._$defaultActions[action.keyCode] === curAction) {
            delete obj._$defaultActions[action.keyCode];
        } else {
            return true;
        }
    }
}

// @ts-ignore
KeyHook.prototype._template = template;

export default KeyHook;
