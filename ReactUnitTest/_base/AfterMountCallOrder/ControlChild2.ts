import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/AfterMountCallOrder/ControlChild2';

export default class ControlChild2 extends Control {
    _template: TemplateFunction = template;

    _beforeUpdate() {
        return;
    }
}
