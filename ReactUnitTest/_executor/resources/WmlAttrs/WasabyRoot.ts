import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/WmlAttrs/WasabyRoot';

interface IWasabyRootOptions extends IControlOptions {
    reactFunction?: boolean;
    reactComponent?: boolean;
    dataQaFn?: boolean;
    dataQaCls?: boolean;
    clearProps?: boolean;
}
export default class WasabyRoot extends Control<IWasabyRootOptions> {
    _template: TemplateFunction = template;
}
