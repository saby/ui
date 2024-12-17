import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/Childs/CaseSecond/NotAsync/Grid');

export default class Grid extends Control {
    protected _template: TemplateFunction = template;
}
