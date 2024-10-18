/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import type Control from 'UICore/_base/Control';
import { IControlObj } from 'UICore/Ref';
import { TControlNode } from './TControlNode';
import { IControl } from 'UICommon/interfaces';

interface IHTMLElementWithControlObj extends HTMLElement {
    _$controls: IControlObj[];
}

function isHTMLElementWithControlObj(element: HTMLElement): element is IHTMLElementWithControlObj {
    return element && typeof element === 'object' && '_$controls' in element;
}

function getNumberId(id: string | 0): number {
    return parseInt((id + '').replace('inst_', ''), 10);
}

function sortedAddControlObj(controls: IControlObj[], controlObj: IControlObj): void {
    const generatedId: number = getNumberId(controlObj.id);

    // Если массив пустой или все id не меньше чем у новой ноды - добавляем в конец.
    let newIndex: number = controls.length;
    for (let index = 0; index < controls.length; ++index) {
        const id = getNumberId(controls[index].id);

        // Добавляем node перед первой из тех, чей id меньше.
        if (id < generatedId) {
            newIndex = index;
            break;
        }
    }
    controls.splice(newIndex, 0, controlObj);
}

function addControlObj(controls: IControlObj[], controlObj: IControlObj): void {
    const controlIdx = controls.indexOf(controlObj);
    const haveControl = controlIdx !== -1;
    if (!haveControl) {
        sortedAddControlObj(controls, controlObj);
    }
}
function findControlObj(controls: IControlObj[], control: IControl): IControlObj {
    const foundControlObj = controls.find((controlObj) => {
        return controlObj.control === control;
    });
    return foundControlObj;
}
function removeControlObj(controls: IControlObj[], controlToRemove: IControl): void {
    if (!controls) {
        return;
    }
    const foundControl = findControlObj(controls, controlToRemove);
    if (foundControl) {
        controls.splice(controls.indexOf(foundControl), 1);
    }
}

export function removeControlObjFromContainer(control: Control<unknown, unknown>): void {
    const element = control._container;
    if (isHTMLElementWithControlObj(element)) {
        removeControlObj(element._$controls, control);
    }
}

export function prepareControls(
    node: TControlNode,
    control: Control<unknown, unknown>,
    lastHTMLElement: HTMLElement
): void {
    const container = node?._container || node;
    if (!container) {
        return;
    }
    if (isHTMLElementWithControlObj(lastHTMLElement) && lastHTMLElement !== container) {
        removeControlObj(lastHTMLElement._$controls, control);
    }
    container._$controls = container._$controls || [];
    const foundControlObj = findControlObj(container._$controls, control);
    if (!foundControlObj) {
        const controlObj: IControlObj = {
            control,
            id: control._instId,
        };

        addControlObj(container._$controls, controlObj);
    }
}
