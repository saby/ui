import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/Adaptive/MiddleControl');

class MiddleControl extends Control {
    protected _template: TemplateFunction = template;
}

export = MiddleControl;
