import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ShouldUpdateParent';

export default class ShouldUpdateParent extends Control {
    _template: TemplateFunction = template;
    _value: string = 'init async';

    _beforeMount(): void {
        this._value += ' before mount';
    }

    _afterMount(): void {
        this._value += ' after mount';
    }

    _shouldUpdate(): boolean {
        this._value += ' should update';
        return true;
    }
}
