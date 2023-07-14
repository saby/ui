import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Child2';

export default class Child2 extends Control {
    _template: TemplateFunction = template;
}
