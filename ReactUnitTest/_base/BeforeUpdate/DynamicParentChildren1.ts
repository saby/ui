import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/BeforeUpdate/DynamicParentChildren1';

export default class DynamicParentChild1 extends Control {
    _template: TemplateFunction = template;
}
