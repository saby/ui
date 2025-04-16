import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyWithTemplateWithClass');

export default class WasabyWithTemplateWithClass extends Control {
    readonly _template: TemplateFunction = template;
}
