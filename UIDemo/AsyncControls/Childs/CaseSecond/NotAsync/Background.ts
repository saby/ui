import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/Childs/CaseSecond/NotAsync/Background');

export default class Background extends Control {
    protected _template: TemplateFunction = template;
}
