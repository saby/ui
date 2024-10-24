/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
/* eslint-disable */
// @ts-nocheck
import { Responsibility, IResponsibilityHandler, WHEEL_EVENT_HANDLER_TYPE } from 'UICore/Ref';
import { logger } from 'Application/Env';

export class CreateWheelEventRef extends Responsibility {
    type: string = WHEEL_EVENT_HANDLER_TYPE;

    constructor(private handler: (e) => void) {
        super();
    }

    getHandler(): IResponsibilityHandler {
        if (!this.handler) {
            return (): void => {
                return;
            };
        }
        return (node: HTMLElement): void => {
            if (node) {
                try {
                    if (node.__$wheelEvent) {
                        node.removeEventListener('wheel', node.__$wheelEvent);
                        delete node.__$wheelEvent;
                    }
                    node.addEventListener('wheel', this.handler, {
                        passive: false,
                    });
                    node.__$wheelEvent = this.handler;
                } catch (e) {
                    if (e.message === 'WrongEventArr') {
                        logger.error('Неправильно переданы события', node);
                    }
                }
            }
        };
    }
}
