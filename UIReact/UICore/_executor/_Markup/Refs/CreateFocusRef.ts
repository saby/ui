import { logger } from 'Application/Env';
import {
    Responsibility,
    IResponsibilityHandler,
    FOCUS_HANDLER_TYPE,
} from 'UICore/Ref';
import { IFocusAttributes, _FocusAttrs } from 'UICommon/Focus';

export class CreateFocusRef extends Responsibility {
    type: string = FOCUS_HANDLER_TYPE;

    constructor(readonly attributes: IFocusAttributes) {
        super();
    }

    getHandler(): IResponsibilityHandler {
        return (node: HTMLElement): void => {
            if (node) {
                if (typeof node.getAttribute !== 'function') {
                    // @ts-ignore функция ожидает только HTMLElement, но ref могут повесить неправильно.
                    const name = node?.constructor?.displayName || '';
                    const message =
                        'Этот ref предназначен для DOM-элементов, ' +
                        'но он используется с классовым компонентом ' +
                        name +
                        '. ' +
                        'Чтобы локализовать проблему, следует включить режим отладки вместе с настройкой ' +
                        '"Append component stacks to console warnings and errors." в react devtools.';
                    logger.error(message);
                    return;
                }
                _FocusAttrs.configureContainer(node, this.attributes);
            }
        };
    }
}
