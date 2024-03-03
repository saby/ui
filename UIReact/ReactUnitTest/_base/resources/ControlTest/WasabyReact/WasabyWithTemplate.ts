import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyWithTemplate');

export default class WasabyWithTemplate extends Control {
    readonly _template: TemplateFunction = template;
}
