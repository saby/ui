import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ShouldComponentUpdate/ControlChild';

interface IControlChildOptions {
    timeToMountChild: number;
    testOption: { updated: boolean };
}

export default class ControlChild extends Control {
    _template: TemplateFunction = template;
    protected _testOption: { updated: boolean };
    protected _beforeUpdateCallsCount: number = 0;

    protected _beforeMount(options: IControlChildOptions): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, options.timeToMountChild);
        });
    }

    protected _beforeUpdate(options: IControlChildOptions): void {
        this._testOption = options.testOption;
        this._beforeUpdateCallsCount++;
    }

    checkState(): boolean {
        if (this._testOption?.updated && this._beforeUpdateCallsCount === 1) {
            return true;
        }
    }
}
