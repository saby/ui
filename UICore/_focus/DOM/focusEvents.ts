/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { logger } from 'Application/Env';
import { preventFocus, hasNoFocus, IKeyPressedData } from 'UICommon/Focus';
import { detection } from 'Env/Env';

import callFocusChangedCallbacks from '../Component/callFocusChangedCallbacks';

let areEventsStarted = false;

export function startFocusEvents(): void {
    if (typeof document === 'undefined' || areEventsStarted) {
        return;
    }
    areEventsStarted = true;

    document.addEventListener('focusin', focusInHandler, true);
    document.addEventListener('focusout', focusOutHandler, true);
    document.addEventListener('mousedown', mouseDownHandler, true);
    document.addEventListener('keydown', keyDownHandler, true);
}

export function stopFocusEvents(): void {
    if (typeof document === 'undefined' || !areEventsStarted) {
        return;
    }
    areEventsStarted = false;

    document.removeEventListener('focusin', focusInHandler, true);
    document.removeEventListener('focusout', focusOutHandler, true);
    document.removeEventListener('mousedown', mouseDownHandler, true);
    document.removeEventListener('keydown', keyDownHandler, true);
}

let lastActiveElement: HTMLElement;
let nextActiveElement: HTMLElement | null = null;

let keyPressedData: IKeyPressedData | null = null;

function keyDownHandler({ key, target, shiftKey, ctrlKey, altKey }: KeyboardEvent): void {
    keyPressedData = {
        key,
        target,
        shiftKey,
        ctrlKey,
        altKey,
    };
    setTimeout(() => {
        keyPressedData = null;
    });
}

function focusInHandler(event: FocusEvent): void {
    nextActiveElement = event.target as HTMLElement;
    const focusChangedConfig = {
        keyPressedData,
        isTabPressed: !!keyPressedData && keyPressedData.key === 'Tab',
        isShiftKey: !!keyPressedData && keyPressedData.shiftKey,
    };

    callFocusChangedCallbacks(lastActiveElement, nextActiveElement, focusChangedConfig);
}

function focusOutHandler(event: FocusEvent): void {
    lastActiveElement = event.target as HTMLElement;
}

function mouseDownHandler(event: MouseEvent): void {
    const preventDefault = event.preventDefault;
    event.preventDefault = function noFocusPreventDefault(): void {
        // TODO: А может перенести внутрь preventFocus? Дважды для одного элемента вызывается hasNoFocus.
        if (!hasNoFocus(this.target as Element)) {
            // не могу стрелять error, в интеграционных тестах попапы тоже зовут preventDefault
            logger.warn('Вызван preventDefault у события mousedown в обход атрибута ws-no-focus!');
        }
        if (detection.isIE) {
            clickFakeElement();
        }
        return preventDefault.apply(this);
    };
    preventFocus(event);
}

/*
Костылефикс странной ошибки IE. Примерный сценарий такой (надеюсь, я правильно докопал в итоге):
1. Фокусируем поле ввода
2. Кликаем на какой-нибудь элемент, который зовёт preventDefault события mousedown.
3. Удаляем сфокусированное поле ввода (из-за preventDefault фокус остался там).
Если сделать так в IE, следующие клики по элементу из второго пункта не будут стрелять нативным событием click.
При этом mousedown и mouseup продолжат стрелять. И это будет продолжатся, пока не кликнем что-то другое.

Суть фикса как раз в том, что искуственно вызывается клик "чего-то другого". И поэтому все клики будут стрелять.
*/
function clickFakeElement(): void {
    const input = document.createElement('input');
    input.hidden = true;
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}
