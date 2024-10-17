/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { Responsibility, IResponsibilityHandler, CONTROL_NODE_HANDLER_TYPE } from 'UICore/Ref';
import { prepareControlNodes } from './_ref/ControlNodes';
import type Control from '../Control';

export class CreateControlNodeRef extends Responsibility {
    private readonly _control: Control<unknown, unknown>;
    type: string = CONTROL_NODE_HANDLER_TYPE;

    constructor(control: Control<unknown, unknown>) {
        super();
        this._control = control;
    }

    getHandler(): IResponsibilityHandler {
        return (node: HTMLElement): void => {
            prepareControlNodes(node, this._control);
        };
    }
}
