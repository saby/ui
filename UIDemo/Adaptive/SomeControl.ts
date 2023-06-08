import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/Adaptive/SomeControl');

class SomeControl extends Control {
    protected _template: TemplateFunction = template;
}

export = SomeControl;
