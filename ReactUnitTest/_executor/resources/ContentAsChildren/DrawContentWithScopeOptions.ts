import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/DrawContentWithScopeOptions');

export default class DrawContentWithScopeOptions extends Control {
    protected _template: TemplateFunction = template;
}
