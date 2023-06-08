import { constants } from 'Env/Env';
import { Logger } from 'UICommon/Utils';
import { IControlObj } from './_ref/Responsibility';
import { IControl } from 'UICommon/interfaces';

export const focusCallbacksObjectsSetName = 'focus-callbacks-objects';

export interface IWrapHTMLElement extends Node {
    jquery?: unknown;
    wsControl?: string;
    _$controls?: IControlObj[];
}

type TControlOrCompat = IControl & {
    _container: IWrapHTMLElement;
};

const isBrowserPlatform = typeof document !== 'undefined';

export function goUpByControlTree(
    target: IWrapHTMLElement,
    array?: IControl[],
    withFocusCallbacksObjects: boolean = false
): IControl[] {
    const controlTree = array || [];
    if (!isBrowserPlatform) {
        return controlTree;
    }
    const element = target?.jquery ? target[0] : target;
    if (
        element &&
        element !== document.documentElement &&
        element !== document.body
    ) {
        if (element._$controls && element._$controls.length) {
            try {
                if (withFocusCallbacksObjects) {
                    addFocusCallbacksObjectsToFlatArray(
                        element,
                        element.parentNode,
                        controlTree
                    );
                }
                addControlsToFlatArray(
                    element._$controls[0],
                    controlTree,
                    withFocusCallbacksObjects
                );
                if (withFocusCallbacksObjects) {
                    const topContainer =
                        controlTree[controlTree.length - 1]?._container;
                    addFocusCallbacksObjectsToFlatArray(
                        topContainer,
                        document.body,
                        controlTree
                    );
                }
            } catch (e) {
                Logger.error(
                    'Ошибка NodeCollector',
                    controlTree[controlTree.length - 1],
                    e
                );
            }
        } else if (
            constants.compat &&
            element.wsControl &&
            element.wsControl._container?.[0] === element
        ) {
            try {
                if (withFocusCallbacksObjects) {
                    addFocusCallbacksObjectsToFlatArray(
                        element,
                        element.parentNode,
                        controlTree
                    );
                }
                // Если встретили старый компонент, нужно собирать его парентов по старому API
                addControlsToFlatArrayOld(
                    element.wsControl,
                    controlTree,
                    withFocusCallbacksObjects
                );
                if (withFocusCallbacksObjects) {
                    const topContainer =
                        controlTree[controlTree.length - 1]?._container;
                    addFocusCallbacksObjectsToFlatArray(
                        topContainer,
                        document.body,
                        controlTree
                    );
                }
            } catch (e) {
                Logger.error(
                    'Ошибка NodeCollector(Old)',
                    controlTree[controlTree.length - 1],
                    e
                );
            }
        } else {
            if (withFocusCallbacksObjects) {
                addFocusCallbacksObjectsToFlatArray(
                    element,
                    element.parentNode,
                    controlTree
                );
            }
            // Рекурсивно поднимаемся вверх по элементам, пока не сможем вычислить ближайший компонент
            goUpByControlTree(
                element.parentNode,
                controlTree,
                withFocusCallbacksObjects
            );
        }
    }
    return controlTree;
}
export function getClosestControl(element: HTMLElement): IControl {
    return goUpByControlTree(element)[0];
}

/**
 * Вычисляет controlNode для control
 * @param control
 * @returns {*}
 */
function getControlObj(control: IControl): IControlObj {
    // @ts-ignore _container сейчас protected
    const controls = control._container._$controls;
    for (const i in controls) {
        if (controls.hasOwnProperty(i)) {
            if (controls[i].control === control) {
                return controls[i];
            }
        }
    }
}

function checkOpener(opener: IControl): void {
    let error;

    if (opener) {
        // Component instance must have _options or props
        // @ts-ignore _options -> protected
        if (opener && !(opener._options || opener.props)) {
            // @ts-ignore getName -> protected
            const name = opener.getName ? opener.getName() : '[not detected]';
            // @ts-ignore _moduleName -> protected
            error = `Control ${opener._moduleName} with name ${name} must have _options`;
        }
    }

    if (error) {
        const message = `[UICore/_nodeCollector/goUpByControlTree:checkOpener] DOMEnvironment - Incorrect opener or parent is found! It seems that anybody set wrong opener option! ${error}`;
        Logger.error(message, opener);
    }
}

function isAlive(control: IControl): boolean {
    if (!control) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore может прийти совместимость.
    return !(control._destroyed || control._isDestroyed) && control._container;
}
/**
 * Focus parent is a component that contains the given control
 * "logically" and receives the focus whenever the given control
 * is focused.
 * @param control Control to get the focus parent for
 * @returns Focus parent of the given control
 */
function getFocusParent(
    control: TControlOrCompat,
    array: IControl[],
    withFocusCallbacksObjects: boolean
): IControl | null {
    // ищем предка текущего контрола, сначала смотрим есть ли opener, если нет - берем parent
    // @ts-ignore _options -> protected
    let result =
        control?._options?.opener ||
        // @ts-ignore getOpener -> protected
        control?.getOpener?.() ||
        control?._options?.parent ||
        control?._options?._physicParent ||
        // @ts-ignore getParent -> protected
        control?.getParent?.();
    // Временно (надеюсь) поддержим дальшейший подъём по дереву через чистый реакт компонент,
    // если у него есть DOM элемент в поле _container.
    if (!result && isAlive(control)) {
        const container: HTMLElement = control._container.jquery
            ? control._container[0]
            : control._container;
        result = container?.parentNode;
        if (withFocusCallbacksObjects) {
            addFocusCallbacksObjectsToFlatArray(container, result, array);
        }
    }
    if (result instanceof HTMLElement) {
        result = getClosestControl(result);
    }
    if (isAlive(result)) {
        return result;
    }
    return null;
}

/**
 * Очень сырой механизм, но как быстрое решение наверное сойдёт.
 * Не для наружного использования, так что при необходимости легко будет модифицировать.
 * @param fromContainer - начало подъёма, включительно
 * @param toContainer - конец подъёма, не включительно
 * @param array - массив для пуша результата.
 * @private
 */
function addFocusCallbacksObjectsToFlatArray(
    fromContainer: IWrapHTMLElement,
    toContainer: IWrapHTMLElement,
    array: IControl[]
): void {
    const fixedFromContainer = fromContainer?.jquery
        ? fromContainer[0]
        : fromContainer;
    const fixedToContainer = toContainer?.jquery ? toContainer[0] : toContainer;
    if (
        !fixedFromContainer ||
        !fixedToContainer ||
        !fixedToContainer.contains(fixedFromContainer)
    ) {
        return;
    }
    for (
        let currentContainer = fixedFromContainer;
        currentContainer !== fixedToContainer;
        currentContainer = currentContainer.parentNode
    ) {
        const focusCallbacksObjectsSet: Set<IControl> =
            currentContainer[focusCallbacksObjectsSetName];
        if (focusCallbacksObjectsSet) {
            focusCallbacksObjectsSet.forEach((focusCallbacksObject) => {
                if (!array.includes(focusCallbacksObject)) {
                    array.push(focusCallbacksObject);
                }
            });
        }
    }
}

/**
 * Recursively collect array of openers or parents
 * @param controlObj
 * @param array
 */
function addControlsToFlatArray(
    controlObj: IControlObj,
    array: IControl[],
    withFocusCallbacksObjects: boolean
): void {
    const control = controlObj.control as unknown as IControl;
    const last = array[array.length - 1];
    if (last !== control) {
        if (withFocusCallbacksObjects && last) {
            addFocusCallbacksObjectsToFlatArray(
                last._container,
                control._container,
                array
            );
        }
        array.push(control);
    }

    // Поднимаемся по controlNode'ам, потому что у control'а нет доступа к родительскому контролу
    // @ts-ignore _options -> protected
    let next = control._options.opener || control._options._physicParent;
    if (next && next._destroyed) {
        return;
    }
    if (next && !next.control) {
        if (next._container) {
            checkOpener(next);
            next = getControlObj(next);
        } else {
            // если компонент невизуальный, ничего не ищем
            next = null;
        }
    }
    if (next) {
        addControlsToFlatArray(next, array, withFocusCallbacksObjects);
    } else {
        next = getFocusParent(control, array, withFocusCallbacksObjects);
        checkOpener(next);
        // может мы уперлись в кореневой VDOM и надо посмотреть, есть ли на нем wsControl,
        // если есть - начинаем вслпывать по старому
        if (next) {
            addControlsToFlatArrayOld(next, array, withFocusCallbacksObjects);
        }
    }
}

function addControlsToFlatArrayOld(
    control: IControl,
    array: IControl[],
    withFocusCallbacksObjects: boolean
): void {
    const last = array[array.length - 1];
    if (last !== control) {
        if (withFocusCallbacksObjects && last) {
            addFocusCallbacksObjectsToFlatArray(
                last._container,
                control._container,
                array
            );
        }
        array.push(control);
    }

    const parent = getFocusParent(control, array, withFocusCallbacksObjects);

    checkOpener(parent);

    if (parent) {
        // если найденный компонент является vdom-компонентом, начинаем всплывать по новому
        // @ts-ignore _template & _container -> protected
        if (parent._template && parent._container) {
            // @ts-ignore _container -> protected
            const container = parent._container as IWrapHTMLElement;
            const controls = container?._$controls[0];
            if (controls) {
                addControlsToFlatArray(
                    container._$controls[0],
                    array,
                    withFocusCallbacksObjects
                );
                // @ts-ignore hasCompatible -> protected
            } else if (
                typeof parent.hasCompatible === 'function' &&
                parent.hasCompatible()
            ) {
                // On old pages it is possible that the vdom component has already been destroyed
                // and its control node was removed from container. If it has compatible layer
                // mixed in, we can still get the parent using old methods
                addControlsToFlatArrayOld(
                    parent,
                    array,
                    withFocusCallbacksObjects
                );
            }
        } else {
            addControlsToFlatArrayOld(parent, array, withFocusCallbacksObjects);
        }
    }
}
