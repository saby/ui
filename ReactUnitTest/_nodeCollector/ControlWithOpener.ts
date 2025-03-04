import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_nodeCollector/ControlWithOpener');

export default class ControlWithOpener extends Control {
    protected _template: TemplateFunction = template;
}
