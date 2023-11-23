import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Child1';

export default class Child1 extends Control {
    _template: TemplateFunction = template;
}
