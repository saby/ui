import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/TestDefaultOptionsInner';

export default class TestDefaultOptionsInner extends Control {
    _template: TemplateFunction = template;
    _value: number;

    protected _beforeMount(): void {
        if (!this._options.hasOwnProperty('value')) {
            this._value = 5;
        }
    }

    protected _beforeUpdate(options): void {
        if (this._options.hasOwnProperty('value')) {
            this._value =
                options.value === undefined
                    ? options.maxValue
                    : Math.min(options.maxValue, options.value);
        } else {
            this._value = Math.min(this._value, options.maxValue);
        }
    }
    static getDefaultOptions(): object {
        return {
            value: undefined,
            maxValue: 10,
        };
    }
}
