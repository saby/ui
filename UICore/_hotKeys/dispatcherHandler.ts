/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { constants, detection } from 'Env/Env';
import { KeyboardEvent } from 'react';

interface IExtendEvent extends Event {
    keyCode: number;
    handledByDispatcher: boolean;
    which?: number;
}

export interface ISyntheticEvent extends Event {
    currentTarget: Element;
    nativeEvent: IExtendEvent;
    stopped: boolean;
    target: Element;
    type: string;
    _bubbling: boolean;
}

const doNotDispatchTag: Record<string, number[]> = {
    textarea: [constants.key.del, constants.key.up, constants.key.down],
    input: [constants.key.del],
};

function checkTarget(target: Element): number[] {
    if (!target) {
        return [];
    }
    return doNotDispatchTag[target.tagName.toLowerCase()];
}
function isUnit(nativeEvent: Event) {
    const target = nativeEvent?.target as HTMLElement;
    return target?.classList.contains('unit-test-input');
}
export function dispatcherHandler(
    eventSynthetic: KeyboardEvent<HTMLDivElement> & { handledByDispatcher: boolean }
): void {
    const nativeEvent = eventSynthetic.nativeEvent;
    if (nativeEvent.handledByDispatcher) {
        // TODO https://online.sbis.ru/opendoc.html?guid=0de5f15f-70eb-40da-b3f0-8b99d4eb1c85
        // It's probably not the right way to fix a problem.
        // We shouldn't handle event if it was already handled by Dispatcher
        return;
    }

    nativeEvent.handledByDispatcher = true;
    const key: number =
        'which' in nativeEvent ? (nativeEvent.which as number) : nativeEvent.keyCode;

    // клавиша таб не может быть клавишей по умолчанию, у нее есть конкретное предназначение - переход по табу
    if (key === constants.key.tab) {
        return;
    }

    // в случае когда фокус находится внутри элемента, который имеет нативное поведение на клавиши
    // мы не должны стрелять событиями горячих клавиш
    const isSpecialTag = checkTarget(eventSynthetic.target as Element);
    if (isSpecialTag && isSpecialTag.indexOf(key) > -1) {
        return;
    }

    let needStop = false;
    // если isTrusted = false, значит это мы запустили событие по горячим клавишам,
    // его не надо повторно обрабатывать
    if (nativeEvent.isTrusted || isUnit(nativeEvent)) {
        let currentElem = nativeEvent.target as HTMLElement;
        const closestPopupElem = currentElem.parentElement?.closest('.controls-Popup');
        const closestKeyHookElem = currentElem.parentElement?.closest('.keyhook');

        while (
            currentElem &&
            currentElem !== closestPopupElem &&
            currentElem !== closestKeyHookElem &&
            currentElem !== document.documentElement &&
            currentElem !== document.body
        ) {
            const parent = currentElem;
            // todo раньше могло быть задестроено поэтому была проверка !parent._destroyed &&
            const action = parent._$defaultActions?.get(key);
            if (action) {
                action.action(nativeEvent);
                needStop = true;
                break;
            }
            currentElem = currentElem.parentElement;
        }
    }

    // если диспетчер нашел зарегистрированное действие на сочетание клавиш и запустил обработчик,
    // клавиши считаются обработанными и больше не должны всплывтаь
    if (needStop) {
        eventSynthetic.stopPropagation();

        // в ie надо остановить действие по-умолчанию на backspace
        // по-умолчанию ie возвращается на предыдущую страницу
        if (detection.isIE && key === constants.key.backspace) {
            eventSynthetic.preventDefault();
        }
    }
}
