import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/Runtime/Root';

interface IRootOptions extends IControlOptions {
    value?: number;
}
export default class Root extends Control<IRootOptions> {
    protected _template: TemplateFunction = template;
}
