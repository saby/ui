import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/BeforeUpdate/DynamicParentChildren2';

export default class ControlParent extends Control {
    _template: TemplateFunction = template;
}
