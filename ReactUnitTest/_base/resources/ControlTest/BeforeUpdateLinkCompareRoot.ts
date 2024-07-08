import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/BeforeUpdateLinkCompareRoot';

export default class BeforeUpdateLinkCompareRoot extends Control {
    _template: TemplateFunction = template;
    _version: number = 0;

    updateVersion(): void {
        this._version++;
    }
}
