import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/WasabyReact/TransferEvent/WasabyControl';

const eventQueue: string[] = [];

export default class WasabyControl extends Control {
    _template: TemplateFunction = template;
    _eventQueue: string[] = [];

    _clickHandler(): void {
        this.pushToQueue('click in wasaby');
    }

    _myClickHandler(): void {
        this.pushToQueue('my click in wasaby');
    }

    _clickHandlerInTemplate(): void {
        this.pushToQueue('click template in wasaby');
    }

    _mouseDownHandler(): void {
        this.pushToQueue('mousedown in wasaby');
    }

    pushToQueue(value: string): void {
        eventQueue.push(value);
    }

    _applyEventQueue(): void {
        this._eventQueue = eventQueue;
    }
}
