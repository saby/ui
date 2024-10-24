import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/beforeMountTest/ControlWithBeforeMount2';
export interface ITestControlOptions extends IControlOptions {
    beforeMount: Function;
}

export default class ControlWithState extends Control<ITestControlOptions> {
    _template: TemplateFunction = template;

    protected _beforeMount(opt: ITestControlOptions): void {
        opt.beforeMount.apply(this, arguments);
    }
}
