import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/Children/Wasaby1';

export default class DynamicParent extends Control {
    _template: TemplateFunction = template;
}
