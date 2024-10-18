import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ControlWithChildren';

export default class ControlWithChildren extends Control {
    _template: TemplateFunction = template;

    protected _beforeMount(): Promise<void> | void {
        this.callback = this.callback.bind(this);
    }

    callback() {
        this._options.check(this._children.child?._moduleName);
    }
}
