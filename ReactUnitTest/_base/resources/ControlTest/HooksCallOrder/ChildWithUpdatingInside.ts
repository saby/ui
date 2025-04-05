import { TemplateFunction } from 'UICommon/Base';
import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/HooksCallOrder/ChildWithUpdatingInside';

export default class ChildWithUpdatingInside extends Control {
    protected _template: TemplateFunction = template;
    protected counter: number = 0;

    upCounter(): void {
        this.counter++;
    }
}
