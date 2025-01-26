import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/Focus/RestoreFocus/Root';

interface IRootOptions extends IControlOptions {
    opener?: unknown;
}
export default class Root extends Control<IRootOptions> {
    _template: TemplateFunction = template;
    protected showFirstInput: boolean = true;
    hideFirstInput(): void {
        this.showFirstInput = false;
    }
}
