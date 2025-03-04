import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControl');

export default class WasabyControl extends Control {
    readonly _template: TemplateFunction = template;
}
