import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithRadioInput';

export default class ControlWithRadioInput extends Control {
    _template: TemplateFunction = template;
    _radioChecked: number = 1;

    protected _changeChecked(event: Event, checkedValue: number): void {
        this._radioChecked = checkedValue;
    }
}
