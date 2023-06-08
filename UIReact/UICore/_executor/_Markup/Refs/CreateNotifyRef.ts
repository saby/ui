import type { Control } from 'UICore/Base';
import { TEventObject } from 'UICommon/Events';
import { WasabyEvents } from 'UICore/Events';
import {
    Responsibility,
    IResponsibilityHandler,
    NOTIFY_EVENT_TYPE,
} from 'UICore/Ref';
import { logger } from 'Application/Env';

export class CreateNotifyRef extends Responsibility {
    private control: Control;
    type: string = NOTIFY_EVENT_TYPE;

    constructor(private events: TEventObject, control?: Control) {
        super();
        this.control = control;
    }

    getHandler(): IResponsibilityHandler {
        if (!Object.keys(this.events).length) {
            return (): void => {
                return;
            };
        }
        return (node: HTMLElement): void => {
            if (node) {
                try {
                    WasabyEvents.getInstance(node).setEventHook(
                        this.events,
                        node,
                        this.control
                    );
                } catch (e) {
                    if (e.message === 'WrongEventArr') {
                        logger.error('Неправильно переданы события', node);
                    }
                }
            }
        };
    }
}
