import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_proxyChildren/DownControl';
import * as downTemplate from 'wml!ReactUnitTest/_proxyChildren/DownTemplate';

export default class DownControl extends Control {
    protected _template: TemplateFunction = template;
    protected _downTemplate: TemplateFunction = downTemplate;
}
