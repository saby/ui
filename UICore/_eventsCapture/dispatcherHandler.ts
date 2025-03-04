/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { constants, detection } from 'Env/Env';
import { traverseParents } from './traverseParents';
import { ISyntheticEvent, MyHTMLElement } from './interfaces';

/**
 * Создание события нажатия определенной клавиши
 */
function createEvent(sourceEvent: Event): Event {
    return new (sourceEvent.constructor as typeof Event)(sourceEvent.type, sourceEvent);
}

function isUnit(nativeEvent: Event) {
    const target = nativeEvent?.target as HTMLElement;
    return target?.classList.contains('unit-test-input');
}
export function dispatcherHandler(eventSynthetic: ISyntheticEvent): void {
    const nativeEvent = eventSynthetic.nativeEvent;
    if (nativeEvent.handledByDispatcher) {
        // TODO https://online.sbis.ru/opendoc.html?guid=0de5f15f-70eb-40da-b3f0-8b99d4eb1c85
        // It's probably not the right way to fix a problem.
        // We shouldn't handle event if it was already handled by Dispatcher
        return;
    }
    nativeEvent.handledByDispatcher = true;

    let needStop = false;
    // если isTrusted = false, значит это мы запустили событие по горячим клавишам,
    // его не надо повторно обрабатывать
    if (nativeEvent.isTrusted || isUnit(nativeEvent)) {
        traverseParents<MyHTMLElement>((currentElem) => {
            const eventCatchers = currentElem._$eventCatchers?.getAll();
            eventCatchers?.find(([catchEvent, container]): boolean => {
                if (catchEvent(nativeEvent)) {
                    const event = createEvent(nativeEvent);
                    container.dispatchEvent(event);
                    needStop = true;
                    return true;
                }
                return false;
            });
            return needStop;
        }, nativeEvent.target as MyHTMLElement);
    }

    // если диспетчер нашел зарегистрированное действие на сочетание клавиш и запустил обработчик,
    // клавиши считаются обработанными и больше не должны всплывтаь
    if (needStop) {
        eventSynthetic.stopPropagation();

        if (nativeEvent?.constructor === window.KeyboardEvent) {
            const keyboardEvent = nativeEvent as KeyboardEvent;
            const key: number = keyboardEvent.which ?? keyboardEvent.keyCode;
            // в ie надо остановить действие по-умолчанию на backspace
            // по-умолчанию ie возвращается на предыдущую страницу
            if (detection.isIE && key === constants.key.backspace) {
                eventSynthetic.preventDefault();
            }
        }
    }
}
