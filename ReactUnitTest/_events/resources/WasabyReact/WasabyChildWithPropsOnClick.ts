import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_events/resources/WasabyReact/WasabyChildWithPropsOnClick');

export default class WasabyChildWithPropsOnClick extends Control {
    readonly _template: TemplateFunction = template;
}
