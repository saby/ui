import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlHocWithClass');

export default class WasabyControlHocWithClass extends Control {
    readonly _template: TemplateFunction = template;
}
