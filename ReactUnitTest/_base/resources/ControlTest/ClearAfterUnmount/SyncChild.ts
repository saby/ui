import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ClearAfterUnmount/SyncChild';

export default class SyncChild extends Control {
    _template: TemplateFunction = template;

    protected _beforeUnmount(): void {
        this._notify('notifyEvent', [], { bubbling: true });
    }
}
