import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_refs/resources/InnerControl';

export default class InnerControl extends Control {
    _template: TemplateFunction = template;
}
