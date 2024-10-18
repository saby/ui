import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/WrapperDelete';

export default class WrapperDelete extends Control {
    _template: TemplateFunction = template;
    protected _showChild: boolean = true;

    getChild(): Control {
        if (this._children && this._children.hasOwnProperty('MyChild')) {
            return this._children.MyChild as Control;
        }
        return undefined;
    }

    hideChild(): void {
        this._showChild = false;
    }
}
