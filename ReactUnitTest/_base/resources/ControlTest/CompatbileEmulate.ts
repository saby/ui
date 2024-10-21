import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/CompatbileEmulate';

export default class CompatbileEmulate extends Control {
    _template: TemplateFunction = template;
    protected _testValue: string = '';
    protected _beforeMount(): void {
        // эмулируем подмешивание совместимости
        this._decOptions = { class: 'compatilbe' };
    }

    changeTestOption(value: string): void {
        this._testValue = value;
    }
}
