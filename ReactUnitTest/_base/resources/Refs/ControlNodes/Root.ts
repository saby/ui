import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/Refs/ControlNodes/Root';

export default class Root extends Control {
    _template: TemplateFunction = template;
    protected wasChildrenControlNodeUpdate: boolean = true;
    protected _testOption: string;

    protected itemClickHandler(
        event: Event,
        controlNodeAgrs: number,
        itemValue: number
    ) {
        if (controlNodeAgrs !== itemValue) {
            this.wasChildrenControlNodeUpdate = false;
        } else {
            this.wasChildrenControlNodeUpdate = true;
        }
    }

    changeTestOption(value: string): void {
        this._testOption = value;
    }
}
