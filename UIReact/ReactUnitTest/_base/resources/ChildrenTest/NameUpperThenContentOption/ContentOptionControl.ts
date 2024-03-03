import { TemplateFunction, Control } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NameUpperThenContentOption/ContentOptionControl';

export default class ContentOptionControl extends Control {
    _template: TemplateFunction = template;
}
