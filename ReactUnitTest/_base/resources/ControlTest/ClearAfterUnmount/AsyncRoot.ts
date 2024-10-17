import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ClearAfterUnmount/AsyncRoot';

export default class AsyncRoot extends Control {
    _template: TemplateFunction = template;
    showChild: boolean = true;
    notifyResult: string = '';

    protected _afterMount(): void {
        this.showChild = false;
    }

    _notifyHandler(): void {
        this.notifyResult = 'notified';
    }
}
