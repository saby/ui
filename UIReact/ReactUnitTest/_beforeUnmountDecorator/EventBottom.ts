import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_beforeUnmountDecorator/EventBottom';

export default class EventBottom extends Control {
    _template: TemplateFunction = template;

    _beforeUnmount(): void {
        this._notify('customEvent', [], { bubbling: true });
    }
}
