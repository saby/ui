import {
    Responsibility,
    IResponsibilityHandler,
    ATTRIBUTES_HANDLER_TYPE,
} from 'UICore/Ref';

export class CreateAttrsRef extends Responsibility {
    private attrKey: string;
    type: string = ATTRIBUTES_HANDLER_TYPE;

    constructor(attrKey: string) {
        super();
        this.attrKey = attrKey;
    }

    getHandler(): IResponsibilityHandler {
        return (node: HTMLElement): void => {
            if (node && typeof node.setAttribute === 'function') {
                node.setAttribute('key', this.attrKey);
            }
            if (node && node._container) {
                node._container.setAttribute('key', this.attrKey);
            }
        };
    }
}
