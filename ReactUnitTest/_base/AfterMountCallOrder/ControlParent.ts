import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/AfterMountCallOrder/ControlParent';

export default class ControlParent extends Control {
    _template: TemplateFunction = template;
}
