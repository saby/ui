import {
    Responsibility,
    IResponsibilityHandler,
    CLEAR_HANDLER_TYPE,
} from 'UICore/Ref';
import { TimeoutHandlersQueue } from './TimeoutHandlersQueue';

const clearElementTimeout = 5000;
const timeoutHandlersQueue = new TimeoutHandlersQueue(clearElementTimeout);

/**
 * Временное решение для уменьшения утечки памяти.
 * Модуль, чтобы чистить поля дом элемента после удаления из DOM.
 * Не удалось быстро найти причину застревания в памяти detached элементов. Похоже, где-то в замыкании остаются.
 * Сами элементы продолжат течь, но хотя бы висящие на них пропсы будут удалены. Это подавляющая часть памяти.
 * Чистятся как васаби, так и реактовские служебные поля элемента.
 * Следует удалить модуль, как только найдётся причина застревания элементов в памяти.
 * @private
 */

export class CreateClearElementRef extends Responsibility {
    private element: HTMLElement;

    type: string = CLEAR_HANDLER_TYPE;

    getHandler(): IResponsibilityHandler {
        return (node: HTMLElement): void => {
            if (node) {
                this.element = node;
                return;
            }
            timeoutHandlersQueue.addHandler(() => {
                // unmount ref вызывается и при обновлении. Если через timeout элемент вернулся -  не чистим поля.
                if (!this.element || document.body.contains(this.element)) {
                    return;
                }
                const element = this.element;
                this.element = undefined;

                this.clearElement(element);

                for (let i = 0; i < element.childNodes.length; i++) {
                    const elementChild = element.childNodes[i];
                    if (elementChild.nodeType === Node.TEXT_NODE) {
                        this.clearElement(elementChild);
                    }
                }
            });
        };
    }

    private clearElement(element: Node): void {
        // Стандартные поля элемента не попадают в Object.keys. Здесь будут только присвоенные вручную поля.
        for (const fieldToClear of Object.keys(element)) {
            try {
                // Может не быть сеттера. delete надёжнее, чем присваивание undefined.
                delete element[fieldToClear];
            } catch (e) {
                // Иногда, например в ie при добавлении класса, в Object.keys всё-таки попадают стандартные поля.
                // И попытки их переприсвоить или удалить генерируют ошибку.
                // Поскольку нам главное удалить только наши и реактовские поля,
                // и имена реактовских нам неизвестны, такую ошибку проще проглотить.
            }
        }
        // Максимальная очистка. Плюс удобнее будет искать элементы, которые релаьно застравают в памяти.
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}
