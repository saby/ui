/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { Responsibility, IResponsibilityHandler, CONTROL_NODE_HANDLER_TYPE } from 'UICore/Ref';
import { prepareControlNodes } from './_ref/ControlNodes';
import type { TAnyControl } from '../interfaces';

export class CreateControlNodeRef extends Responsibility {
    private readonly _control: TAnyControl;
    type: string = CONTROL_NODE_HANDLER_TYPE;

    constructor(control: TAnyControl) {
        super();
        this._control = control;
    }

    getHandler(): IResponsibilityHandler {
        return (node: HTMLElement | null): void => {
            prepareControlNodes(node, this._control);
        };
    }
}
