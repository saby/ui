import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/TestDefaultOptions';

export default class TestDefaultOptions extends Control {
    _template: TemplateFunction = template;
}
