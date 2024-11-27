import { Control, TemplateFunction } from 'UI/Base';
import { withAdaptiveMode } from 'UI/Adaptive';
import template = require('wml!UIDemo/Adaptive/SomeControl');

class SomeControl extends Control {
    protected _template: TemplateFunction = template;
}

export default withAdaptiveMode(SomeControl);
