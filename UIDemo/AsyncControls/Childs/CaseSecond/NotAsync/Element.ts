import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/Childs/CaseSecond/NotAsync/Element');

export default class Element extends Control {
    protected _template: TemplateFunction = template;
}
