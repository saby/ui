/* eslint-disable */

/**
 */
// @ts-ignore
import { delay } from 'Types/function';
import { TimeoutHandlersQueue } from './TimeoutHandlersQueue';

// свойство, которое дает нам понять, что если произошел unmount и сразу mount, значит удаления
// элемента не было и мы можем не удалять элемент из списка
const deletedPropertyName = '__$delete__';

interface IClearChild {
    [deletedPropertyName]?: boolean;
    isFocusActivator?: boolean;
    destroy: () => void;
}

type TClearChildren = Record<string, IClearChild>;

export function onElementMount(child: unknown) {
    (child as IClearChild)[deletedPropertyName] = false;
}

const clearChildrenTimeout = 100;
const timeoutHandlersQueue = new TimeoutHandlersQueue(clearChildrenTimeout);

function clearChildren(children: Record<string, unknown>, childName: string) {
    if (hasChild(children, childName) && children[childName][deletedPropertyName]) {
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
export function onElementUnmount(children: Record<string, unknown>, childName: string) {
    if (hasChild(children, childName)) {
        children[childName][deletedPropertyName] = true;
    }
    timeoutHandlersQueue.addHandler(() => {
        clearChildren(children, childName);
    });
}

function hasChild(
    children: Record<string, unknown>,
    childName: string
): children is TClearChildren {
    return !!children && children.hasOwnProperty(childName);
}
