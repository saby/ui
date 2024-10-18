import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlWithClass');

export default class WasabyControlWithClass extends Control {
    readonly _template: TemplateFunction = template;
}
