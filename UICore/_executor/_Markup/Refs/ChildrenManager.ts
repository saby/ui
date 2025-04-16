/* eslint-disable */

/**
 */
// @ts-ignore
import { delay } from 'Types/function';
import { TimeoutHandlersQueue } from './TimeoutHandlersQueue';
import { Logger } from 'UICommon/Utils';

// свойство, которое дает нам понять, что если произошел unmount и сразу mount, значит удаления
// элемента не было и мы можем не удалять элемент из списка
const deletedPropertyName = '__$delete__';

interface IClearChild {
    [deletedPropertyName]?: boolean;
    isFocusActivator?: boolean;
    destroy: () => void;
    _moduleName?: string;
    displayName?: string;
}
type TClearChildren = Record<string, IClearChild>;

export function onElementMount(child: IClearChild) {
    try {
        (child as IClearChild)[deletedPropertyName] = false;
    } catch (e: any) {
        Logger.error(`Отладочная информация в UICore/Executor для поиска реальной ошибки.
        Вызывается метод onElementMount.
        Контрол ${child._moduleName ?? child.displayName}.
        ${e.message}`);
    }
}

const clearChildrenTimeout = 100;
const timeoutHandlersQueue = new TimeoutHandlersQueue(clearChildrenTimeout);

function clearChildren(children: Record<string, any>, childName: string) {
    let deleted;
    try {
        if (hasChild(children, childName)) {
            deleted = children[childName]?.[deletedPropertyName];
        }
    } catch (e: any) {
        Logger.error(`Отладочная информация в UICore/Executor для поиска реальной ошибки.
        Вызывается метод clearChildren.
        Контрол ${children[childName]?._moduleName ?? children[childName]?.displayName}.
        Обращение к дочернему контролу с названием ${childName}.
        ${e.message}`);
    }
    if (deleted) {
        if (children[childName].isFocusActivator) {
            children[childName].destroy();
        }
        delete children[childName];
    }
}

// Перед удалением детей из списка _children нужно убедится что ref действительно сработал на удаление
// нод. В случае если выполняется событие, оно может попасть в период между unmount и mount элемента
// на самом деле в этот момент элемент из дома не удален - во время работы патча такое может произойти
// с любым элементов VDOM
export function onElementUnmount(children: Record<string, any>, childName: string) {
    if (hasChild(children, childName)) {
        try {
            children[childName][deletedPropertyName] = true;
        } catch (e: any) {
            Logger.error(`Отладочная информация в UICore/Executor для поиска реальной ошибки.
            Вызывается метод onElementUnmount.
            Контрол ${children[childName]._moduleName ?? children[childName].displayName}.
            Обращение к дочернему контролу с названием ${childName}.
            ${e.message}`);
        }
    }
    timeoutHandlersQueue.addHandler(() => {
        clearChildren(children, childName);
    });
}

// тут нужна проверка на hasOwnProperty, т.к. анмаунт фазы классовых и функциональных контролов не совпадают
// и вполне может быть ситуация, когда классовый контрол уже отмонтирован, а функциональный нет
// поэтому когда мы попадет в реф функционального контрола, его родитель уже может быть очищен
// нам же нужно проверить не осталось ли ссылок в _children, если нет, значит все успешно очищено
// проверка же через обращение children?.[childName] приведет к тому что мы сами в свой варнинг из ProxyChildren попадем
// хотя фактически ничего в _children нет, и никакой утечки быть не может
function hasChild(
    children: Record<string, unknown>,
    childName: string
): children is TClearChildren {
    return !!children && children.hasOwnProperty(childName);
}
