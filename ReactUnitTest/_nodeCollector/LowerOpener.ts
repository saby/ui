import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/_nodeCollector/LowerOpener');

interface ILowerOpenerOptions extends IControlOptions {
    setOpener: (control: LowerOpener) => void;
}

export default class LowerOpener extends Control<ILowerOpenerOptions> {
    protected _template: TemplateFunction = template;
    _afterMount(): void {
        this._options.setOpener(this);
    }
}
