import { IControl } from 'UICommon/interfaces';
import {
    TControl,
    IWrapHTMLElement,
    TControlOrCompat,
    focusCallbacksObjectsSetName,
} from './INodeCollector';
import { getClosestControlInner } from './getClosestControl';
import { IControlOptions } from 'UICommon/Base';

const currentGoUpSet = new Set();

// TODO перевести всех пользователей на TControl, заменить goUpByControlTreeInner на goUpByControlTree.
export function goUpByControlTree(
    target: IWrapHTMLElement,
    array?: IControl[],
    withFocusCallbacksObjects: boolean = false
): IControl[] {
    return goUpByControlTreeInner(
        target,
        array as unknown as TControl[],
        withFocusCallbacksObjects
    ) as unknown as IControl[];
}

export function goUpByControlTreeInner(
    target: IWrapHTMLElement,
    array?: TControl[],
    withFocusCallbacksObjects: boolean = false
): TControl[] {
    const controlTree = array || [];
    const closestControl = getClosestControlInner(target) as TControlOrCompat;
    if (!closestControl) {
        return controlTree;
    }
    if (!withFocusCallbacksObjects) {
        addControlsToFlatArray(closestControl, controlTree, true);
        currentGoUpSet.clear();
        return controlTree;
    }

    addFocusCallbacksObjectsToControlTree(target, closestControl._container, controlTree);

    const flatArray: TControlOrCompat[] = [];
    addControlsToFlatArray(closestControl, flatArray, false);

    for (let i = 0; i < flatArray.length; i++) {
        const control = flatArray[i];
        if (!control.isFocusActivator) {
            controlTree.push(control);
        }

        addFocusCallbacksObjectsToControlTree(
            control._container,
            flatArray[i + 1] ? flatArray[i + 1]._container : document.body,
            controlTree
        );
    }
    currentGoUpSet.clear();
    return controlTree;
}

function addControlsToFlatArray(
    control: TControlOrCompat,
    array: TControl[],
    skipActivator: boolean
): void {
    if (currentGoUpSet.has(control)) {
        const index = array.indexOf(control);
        const namesArr = [];
        for (let i = index; i < array.length; i++) {
            namesArr.push(array[i]._moduleName);
        }
        namesArr.push(control._moduleName);
        const errorMessage =
            'Подъём по дереву контролов зациклился. Возможные причины:\n' +
            '1. Внутри цикла есть чистый реакт в корне васаби, который не прокинул ref.\n' +
            '2. Оперером указан контрол, находящийся в поддереве того, для кого он опенер.\n' +
            namesArr.join(' -> ');

        // явно тащить нельзя, цикл - UICommon/NodeCollector -> UICommon/Utils -> UICommon/NodeCollector
        const Utils = requirejs.defined('UICommon/Utils') && requirejs('UICommon/Utils');
        Utils?.Logger.error(errorMessage);
        return;
    }
    currentGoUpSet.add(control);
    array.push(control);

    let parent: TControlOrCompat = getFocusParent(control);
    if (skipActivator) {
        while (parent?.isFocusActivator) {
            parent = getFocusParent(parent);
        }
    }

    checkOpener(parent);

    if (parent) {
        addControlsToFlatArray(parent, array, skipActivator);
    }
}

function getFocusParent(control: TControlOrCompat): TControlOrCompat | null {
    // ищем предка текущего контрола, сначала смотрим есть ли opener, если нет - берем parent
    const options: IControlOptions & { opener?: IControl } = control?._options;
    let result =
        options?.opener ||
        options?._physicParent ||
        control?.getOpener?.() ||
        options?.parent ||
        control?.getParent?.();
    // Поддержим дальшейший подъём по дереву через чистый реакт компонент, если у него есть DOM элемент в поле _container.
    if (!result && isAlive(control)) {
        const container = control._container.jquery ? control._container[0] : control._container;
        result = container?.parentNode;
    }
    if (result instanceof HTMLElement) {
        result = getClosestControlInner(result);
    }
    if (isAlive(result)) {
        return result;
    }
    return null;
}

function checkOpener(opener: TControlOrCompat): void {
    let error;

    if (opener) {
        // Component instance must have _options or props
        if (opener && !(opener._options || opener.props || opener.isFocusActivator)) {
            const name = opener.getName ? opener.getName() : '[not detected]';
            error = `Control ${opener._moduleName} with name ${name} must have _options`;
        }
    }

    if (error) {
        const message = `[UICore/_nodeCollector/goUpByControlTree:checkOpener] DOMEnvironment - Incorrect opener or parent is found! It seems that anybody set wrong opener option! ${error}`;
        const Utils = requirejs.defined('UICommon/Utils') && requirejs('UICommon/Utils');
        Utils?.Logger.error(message, opener);
    }
}

function isAlive(control: TControlOrCompat): boolean {
    if (!control) {
        return false;
    }
    return !(control._destroyed || control._isDestroyed) && !!control._container;
}

/**
 * Очень сырой механизм, но как быстрое решение наверное сойдёт.
 * Не для наружного использования, так что при необходимости легко будет модифицировать.
 * @param fromContainer - начало подъёма, включительно
 * @param toContainer - конец подъёма, не включительно
 * @param array - массив для пуша результата.
 * @private
 */
function addFocusCallbacksObjectsToControlTree(
    fromContainer: IWrapHTMLElement,
    toContainer: IWrapHTMLElement,
    array: TControl[]
): void {
    const fixedFromContainer = fromContainer?.jquery ? fromContainer[0] : fromContainer;
    const fixedToContainer = toContainer?.jquery ? toContainer[0] : toContainer;
    if (
        !fixedFromContainer ||
        !fixedToContainer ||
        fixedFromContainer === fixedToContainer ||
        !fixedToContainer.contains(fixedFromContainer)
    ) {
        return;
    }
    for (
        let currentContainer = fixedFromContainer;
        currentContainer !== fixedToContainer;
        currentContainer = currentContainer.parentNode
    ) {
        const focusCallbacksObjectsSet: Set<TControl> =
            currentContainer[focusCallbacksObjectsSetName];
        if (focusCallbacksObjectsSet) {
            focusCallbacksObjectsSet.forEach((focusCallbacksObject) => {
                if (currentGoUpSet.has(focusCallbacksObject)) {
                    // Не могу писать ошибку, пока в контролах ошибаются в рефах. А в варнингах нет смысла.
                    return;
                }
                currentGoUpSet.add(focusCallbacksObject);
                array.push(focusCallbacksObject);
            });
        }
    }
}
