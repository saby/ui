import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ControlWithNamedDOMElement';

export default class ControlWithNamedDOMElement extends Control {
    _template: TemplateFunction = template;
}
