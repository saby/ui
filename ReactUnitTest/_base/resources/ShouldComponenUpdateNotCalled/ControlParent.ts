import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ShouldComponenUpdateNotCalled/ControlParent';

export default class ControlParent extends Control {
    _template: TemplateFunction = template;
    protected _testOption: string;

    changeTestOption(value: string): void {
        this._testOption = value;
    }
}
