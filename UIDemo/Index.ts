import { Control, TemplateFunction } from 'UI/Base';
import { Body as BodyAPI } from 'Application/Page';
import template = require('wml!UIDemo/Index');
import 'css!UIDemo/Index';

export default class Index extends Control {
    _template: TemplateFunction = template;

    protected _beforeMount(): void {
        BodyAPI.getInstance().addClass('controls_theme-default'); // чтобы переменные темы применились
    }
}
