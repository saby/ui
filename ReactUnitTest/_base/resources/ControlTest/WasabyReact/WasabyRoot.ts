import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyRoot');

export default class WasabyRoot extends Control {
    readonly _template: TemplateFunction = template;
}
