import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ShouldComponenUpdateNotCalled/ControlChild';

export default class ControlChild extends Control {
    _template: TemplateFunction = template;
    protected _testOption: string;

    protected _beforeMount(options): void {
        this._testOption = options.testOption;
    }

    protected _beforeUpdate(options): void {
        this._testOption = options.testOption;
    }
}
