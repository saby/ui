import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/ControlWithContentBind/Bottom';

export default class ControlWithBind extends Control {
    _template: TemplateFunction = template;

    changeValue(value: string): void {
        this._notify('valueChanged', [value], { bubbling: true });
    }
}
