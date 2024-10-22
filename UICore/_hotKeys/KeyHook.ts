/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { Control } from 'UICore/Base';

// @ts-ignore
import template = require('wml!UICore/_hotKeys/KeyHook');
import { IControlOptions } from 'UICommon/Base';

/**
 * Создание события нажатия определенной клавиши
 */
function createEvent(key: number, sourceEvent: KeyboardEvent): object {
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

interface IActionConfig {
    keyCode: number;
}
interface IOptions extends IControlOptions {
    defaultActions: IActionConfig[];
    context: string;
}

interface IAction {
    action: (sourceEvent: KeyboardEvent) => void;
}
interface IActions {
    [x: number]: IAction[];
}
class DefaultActions {
    private actions: IActions = {};
    add(keyCode: number, action: IAction) {
        this.actions[keyCode] = this.actions[keyCode] || [];
        const index = this.actions[keyCode].indexOf(action);
        if (index === -1) {
            this.actions[keyCode].push(action);
        }
    }
    get(keyCode: number) {
        return this.actions[keyCode] && this.actions[keyCode][0];
    }
    remove(keyCode: number, action: IAction) {
        this.actions[keyCode] = this.actions[keyCode] || [];
        const index = this.actions[keyCode].indexOf(action);
        if (index !== -1) {
            this.actions[keyCode].splice(index, 1);
        }
    }
}

/**
 * Контрол KeyHook - контрол, который указывает клавиши, нажатие на которые будет обработано по умолчанию дочерним
 * контролом. Он регистрирует клавиши по умолчанию для всех предков, у которых еще нет зарегистрированного действия на
 * эту клавишу, и, в случае необработанного нажатия этих клавиш, в дочерний контрол будет перенаправлено событие о
 * нажатии на клавишу, и там будет обработано.
 * @extends UICore/Base:Control
 * @public
 */
class KeyHook extends Control<IOptions> {
    // набор действий по умолчанию, зарегистрированных на определенные клавиши
    private _actions: IActions = {};

    _componentDidMount(): void {
        this.register();
    }

    protected _beforeUpdate() {
        this.unregister();
    }

    protected _componentDidUpdate() {
        this.register();
    }

    destroy() {
        this.unregister();
        super.destroy();
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

            const closestPopupElem =
                this._options.context === 'global'
                    ? null
                    : this._container.parentElement?.closest('.controls-Popup');
            const closestKeyHookElem = this._container.parentElement?.closest('.keyhook');

            // собираем всех предков, и говорим им, какое действие по умолчанию нужно выполнить на необработанное
            // нажатие клавиш
            this._options.defaultActions.forEach((action) => {
                let currentElem = this._container;
                while (
                    currentElem &&
                    currentElem !== closestPopupElem &&
                    currentElem !== closestKeyHookElem &&
                    currentElem !== document.documentElement &&
                    currentElem !== document.body
                ) {
                    this.registerAction(currentElem, action);
                    currentElem = currentElem.parentElement;
                }
            });
        }
    }
    registerAction(obj: HTMLElement, action: IActionConfig) {
        obj._$defaultActions = obj._$defaultActions || new DefaultActions();

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

        obj._$defaultActions.add(action.keyCode, this._actions[action.keyCode]);
    }
    /**
     * Разрегистрация для дочернего контрола горячих клавиш, объявленных в опции defaultActions
     */
    unregister(): void {
        const closestPopupElem =
            this._options.context === 'global'
                ? null
                : this._container.parentElement?.closest('.controls-Popup');
        const closestKeyHookElem = this._container.parentElement?.closest('.keyhook');

        // при удалении контрола произведем разрегистрацию.
        if (this._options.defaultActions) {
            this._options.defaultActions.forEach((action) => {
                let currentElem = this._container;
                while (
                    currentElem &&
                    currentElem !== closestPopupElem &&
                    currentElem !== closestKeyHookElem &&
                    currentElem !== document.documentElement &&
                    currentElem !== document.body
                ) {
                    this.unregisterAction(currentElem, action);
                    currentElem = currentElem.parentElement;
                }
            });
        }
    }
    unregisterAction(obj: HTMLElement, action: IActionConfig) {
        obj._$defaultActions?.remove(action.keyCode, this._actions[action.keyCode]);
    }
}

// @ts-ignore
KeyHook.prototype._template = template;

export default KeyHook;
