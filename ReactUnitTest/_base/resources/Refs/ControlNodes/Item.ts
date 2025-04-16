import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/Refs/ControlNodes/Item';

export default class Item extends Control {
    _template: TemplateFunction = template;
}
