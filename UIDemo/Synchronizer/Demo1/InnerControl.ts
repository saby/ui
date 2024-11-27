// @ts-ignore
import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/Synchronizer/Demo1/InnerControl');

class InnerControl extends Control {
    _template: TemplateFunction = template;
    _click() {
        // @ts-ignore
        const value = this._options.value + 1;
        this._notify('valueChanged', [value]);
    }
}

export default InnerControl;
