import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/AfterMountCallOrder/ControlChild1';

export default class ControlChild1 extends Control {
    _template: TemplateFunction = template;
}
