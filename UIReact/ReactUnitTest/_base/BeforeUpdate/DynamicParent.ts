import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/BeforeUpdate/DynamicParent';

export default class DynamicParent extends Control {
    _template: TemplateFunction = template;

    _dynamicField = 'default';

    _beforeMount(_) {
        this._dynamicField = 'before Mount';
        setTimeout(() => {
            this._dynamicField = 'before Mount dynamic';
        }, 60);
    }
}
