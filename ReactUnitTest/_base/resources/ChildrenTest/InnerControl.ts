import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/InnerControl';

export default class TestControl extends Control {
    _template: TemplateFunction = template;
}
