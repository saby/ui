import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdatingOrder/Bottom';

export default class Bottom extends Control {
    _template: TemplateFunction = template;

    protected _beforeUpdate(opts): void {
        opts.order.push(this._moduleName);
    }
}
