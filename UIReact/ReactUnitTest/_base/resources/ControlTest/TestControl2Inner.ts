import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/TestControl2Inner';

export default class TestControl2Inner extends Control {
    _template: TemplateFunction = template;
}
