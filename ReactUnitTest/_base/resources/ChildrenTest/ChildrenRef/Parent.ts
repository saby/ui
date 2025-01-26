import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Parent';

export default class Parent extends Control {
    _template: TemplateFunction = template;
}
