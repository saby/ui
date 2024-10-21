import * as template from 'wml!ReactUnitTest/_jsx/ConvertContentToElement/SimpleWasaby';
import { Control, IControlOptions, TemplateFunction } from 'UI/Base';

interface ISimpleWasabyOptions extends IControlOptions {
    className?: string;
}

export default class SimpleWasaby extends Control<ISimpleWasabyOptions> {
    protected _template: TemplateFunction = template;
}
