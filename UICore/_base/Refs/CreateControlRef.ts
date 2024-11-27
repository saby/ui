/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { Responsibility, IResponsibilityHandler, CONTROL_HANDLER_TYPE } from 'UICore/Ref';
import { prepareControls } from './_ref/Controls';
import { TControlNode } from './_ref/TControlNode';
import type Control from '../Control';

/**
 * Навешивает на DOMElement _$controls, которые на него смотрят
 * @private
 */
export class CreateControlRef extends Responsibility {
    private lastHTMLElement: HTMLElement;
    type: string = CONTROL_HANDLER_TYPE;

    constructor(readonly _control: Control<unknown, unknown>) {
        super();
    }

    getHandler(): IResponsibilityHandler {
        return (node: TControlNode): void => {
            prepareControls(node, this._control, this.lastHTMLElement);
            if (node && !('_container' in node)) {
                // CreateInvisibleNodeRef переносит _$controls на родителя. Придётся подстроиться.
                this.lastHTMLElement =
                    node.tagName === 'INVISIBLE-NODE' ? (node.parentNode as HTMLElement) : node;
            }
        };
    }

    clearHandler(): void {
        return;
    }
}
