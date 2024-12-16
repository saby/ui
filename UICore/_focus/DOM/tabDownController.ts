/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import getParentFocusComponents from '../Component/getParentFocusComponents';
import { focusNextElement } from './focusNextElement';
import { Set } from 'Types/shim';

// Временная ручка для переходного состояния нового скролла. Будет постоянное true в 22.5000.
import type { TEnableScroll } from 'UICommon/Focus';
let enableScrollToElementOnTab: TEnableScroll = 'vertical';
export function enableHorizontalScrollOnTab(): void {
    enableScrollToElementOnTab = true;
}
export function disableHorizontalScrollOnTab(): void {
    enableScrollToElementOnTab = 'vertical';
}

const allowNativeEventFlagName = '_allowNativeEvent';

type TControlWithAllowNativeEventFlag = {
    [allowNativeEventFlagName]: boolean;
};

function isControlWithAllowNativeEventFlag(
    control: unknown
): control is TControlWithAllowNativeEventFlag {
    return (control as TControlWithAllowNativeEventFlag).hasOwnProperty(allowNativeEventFlagName);
}

// Костыльное решение для возможности использовать Tab в нативной системе сторонних плагинов
// В контроле объявляем свойство _allowNativeEvent = true
// Необходимо проверить все контрол от точки возникновения события до body на наличие свойства
// т.к. возможно событие было вызвано у дочернего контрола для которого _allowNativeEvent = false
// FIXME дальнейшее решение по задаче
// FIXME https://online.sbis.ru/opendoc.html?guid=b485bcfe-3680-494b-b6a7-2850261ef1fb
export default function allowNativeEventForControl(control: unknown): boolean {
    return isControlWithAllowNativeEventFlag(control) && control[allowNativeEventFlagName];
}

class TabDownController {
    private elementsSet: Set<HTMLElement> = new Set();

    addTabDownHandler(element: HTMLElement): void {
        if (!this.elementsSet.has(element)) {
            this.elementsSet.add(element);
            // addTabDownHandler вызывается для корня react приложения.
            // чтобы гарантировать вызов этого обработчика позднее реактовского, вешаем его на родителя
            element.parentNode?.addEventListener(
                'keydown',
                this.handler as EventListenerOrEventListenerObject
            );
        }
    }

    removeTabDownHandler(element: HTMLElement): void {
        if (this.elementsSet.has(element)) {
            this.elementsSet.delete(element);
            element.parentNode?.removeEventListener(
                'keydown',
                this.handler as EventListenerOrEventListenerObject
            );
        }
    }

    private handler(event: KeyboardEvent): void {
        if (event.key !== 'Tab') {
            return;
        }

        const fromElement = event.target as HTMLElement;
        if (getParentFocusComponents(fromElement).find(allowNativeEventForControl)) {
            return;
        }

        if (
            !focusNextElement(event.shiftKey, fromElement, {
                enableScrollToElement: enableScrollToElementOnTab,
            })
        ) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}

export const tabDownController = new TabDownController();
