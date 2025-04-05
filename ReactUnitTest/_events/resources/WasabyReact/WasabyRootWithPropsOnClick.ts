import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_events/resources/WasabyReact/WasabyRootWithPropsOnClick');

export default class WasabyRootWithPropsOnClick extends Control {
    readonly _template: TemplateFunction = template;
}
