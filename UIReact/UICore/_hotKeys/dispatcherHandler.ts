/**
 */
import { goUpByControlTree, IWrapHTMLElement } from 'UICore/NodeCollector';
import { constants, detection } from 'Env/Env';

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

const doNotDispatchTag = {
    textarea: [constants.key.del, constants.key.up, constants.key.down],
    input: [constants.key.del],
};

function checkTarget(target: Element): [number] {
    return doNotDispatchTag[target.tagName.toLowerCase()];
}

export function dispatcherHandler(event: ISyntheticEvent): void {
    const nativeEvent = event.nativeEvent;
    if (nativeEvent.handledByDispatcher) {
        // TODO https://online.sbis.ru/opendoc.html?guid=0de5f15f-70eb-40da-b3f0-8b99d4eb1c85
        // It's probably not the right way to fix a problem.
        // We shouldn't handle event if it was already handled by Dispatcher
        return;
    }

    nativeEvent.handledByDispatcher = true;
    const key =
        'which' in nativeEvent ? nativeEvent.which : nativeEvent.keyCode;

    // клавиша таб не может быть клавишей по умолчанию, у нее есть конкретное предназначение - переход по табу
    if (key === constants.key.tab) {
        return;
    }

    // в случае когда фокус находится внутри элемента, который имеет нативное поведение на клавиши
    // мы не должны стрелять событиями горячих клавиш
    const isSpecialTag = checkTarget(event.target);
    if (isSpecialTag && isSpecialTag.indexOf(key) > -1) {
        return;
    }

    let needStop = false;
    // если isTrusted = false, значит это мы запустили событие по горячим клавишам,
    // его не надо повторно обрабатывать
    if (event.nativeEvent.isTrusted) {
        // ищем только в пределах попапа
        // todo придумать проверку получше https://online.sbis.ru/opendoc.html?guid=50215de6-da5c-44bf-b6f6-a9f7cb0e17d2
        const wholeParents = goUpByControlTree(
            nativeEvent.target as IWrapHTMLElement
        );
        const findIndexFunction = (parent) => {
            return (
                (parent._keysWeHandle && key in parent._keysWeHandle) ||
                parent._moduleName === 'Controls/_popup/Manager/Popup' ||
                parent.preventHotKeys
            );
        };
        const popupIndex = wholeParents.findIndex(findIndexFunction);
        const parents =
            popupIndex === -1
                ? wholeParents
                : wholeParents.slice(0, popupIndex + 1);

        for (let i = 0; i < parents.length; i++) {
            const parent = parents[i];
            if (
                !parent._destroyed &&
                parent._$defaultActions &&
                parent._$defaultActions[key]
            ) {
                parent._$defaultActions[key].action(nativeEvent);
                needStop = true;
                break;
            }
        }
    }

    // если диспетчер нашел зарегистрированное действие на сочетание клавиш и запустил обработчик,
    // клавиши считаются обработанными и больше не должны всплывтаь
    if (needStop) {
        event.stopPropagation();

        // в ie надо остановить действие по-умолчанию на backspace
        // по-умолчанию ie возвращается на предыдущую страницу
        if (detection.isIE && key === constants.key.backspace) {
            event.preventDefault();
        }
    }
}
