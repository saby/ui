import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/TestControl2';

export default class TestControl2Outer extends Control {
    _template: TemplateFunction = template;
}
