import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/BeforeUpdateLinkCompareChild';

export default class BeforeUpdateLinkCompareChild extends Control {
    _template: TemplateFunction = template;
    _someValue: string = 'init';

    _beforeUpdate(newOptions: unknown): void {
        if (this._options !== newOptions) {
            this._someValue = 'new';
        }
    }
}
