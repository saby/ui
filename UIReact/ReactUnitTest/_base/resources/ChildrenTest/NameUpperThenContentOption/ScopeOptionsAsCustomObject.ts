import { TemplateFunction, Control, IControlChildren } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NameUpperThenContentOption/ScopeOptionsAsCustomObject';

export default class ScopeOptionsAsCustomObject extends Control {
    _template: TemplateFunction = template;
}
