import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_events/resources/WasabyReact/WasabyControlHoc');

export default class WasabyControlHoc extends Control {
    readonly _template: TemplateFunction = template;
}
