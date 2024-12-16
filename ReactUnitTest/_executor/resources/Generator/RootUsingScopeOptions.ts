import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/Generator/RootUsingScopeOptions';

interface IOptions extends IControlOptions {
    anotherOption?: string;
}

export default class RootUsingScopeOptions extends Control<IOptions> {
    _template: TemplateFunction = template;
}
