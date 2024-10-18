import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/TestDefaultOptionsInner2';

export default class TestDefaultOptionsInner2 extends Control {
    _template: TemplateFunction = template;
    _valueArray: string[] = [];

    protected _beforeMount(options): void {
        Object.keys(options.valuesObject).forEach((value): void => {
            this._valueArray.push(value);
        });
        this._valueArray.push('some value');
    }

    static getDefaultOptions(): object {
        return {
            valuesObject: {},
        };
    }
}
