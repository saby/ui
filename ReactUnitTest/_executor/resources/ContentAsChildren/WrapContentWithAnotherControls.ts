import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/WrapContentWithAnotherControls');

interface IDrawContentWithScopeOptionsOptions extends IControlOptions {
    somePropFromScope?: string;
}

export default class WrapContentWithAnotherControls extends Control<IDrawContentWithScopeOptionsOptions> {
    protected _template: TemplateFunction = template;
}
