import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdatingOrder/Top';

export default class Top extends Control {
    _template: TemplateFunction = template;

    protected _beforeUpdate(opts): void {
        opts.order.push(this._moduleName);
    }
}
