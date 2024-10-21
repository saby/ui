import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithArrayVersion';

export default class ControlWithArrayVersion extends Control {
    _template: TemplateFunction = template;
    valueArray: any = ['init value 1'];
    arrayVersion: number;

    private _getArrayVersion(): void {
        this.arrayVersion = this.valueArray?.getArrayVersion();
    }
    protected _pushToArray(): void {
        this.valueArray.push('init value 2');
        this._getArrayVersion();
    }
    protected _unshiftToArray(): void {
        this.valueArray.unshift('init value 0');
        this._getArrayVersion();
    }
}
