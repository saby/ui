import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/AsyncTestDemo');

export default class AsyncTestDemo extends Control {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['UIDemo/AsyncControls/AsyncTestDemo'];
}
