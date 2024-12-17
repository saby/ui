import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/TestDefaultOptions2';

export default class TestDefaultOptions2 extends Control {
    _template: TemplateFunction = template;
    _valuesObject = { a: 'abc' };

    protected _beforeMount(): void {
        this._valuesObject = undefined;
    }
}
