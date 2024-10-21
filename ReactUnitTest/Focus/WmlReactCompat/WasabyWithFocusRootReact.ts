import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/Focus/WmlReactCompat/WasabyWithFocusRootReact');

export default class WasabyWithFocusRootReact extends Control {
    _template: TemplateFunction = template;
}
