import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ClearAfterUnmount/AsyncChild';

export default class AsyncChild extends Control {
    _template: TemplateFunction = template;

    protected _afterMount(): void {
        setTimeout(() => {
            this._notify('notifyEvent', [], { bubbling: true });
        }, 50);
    }
}
