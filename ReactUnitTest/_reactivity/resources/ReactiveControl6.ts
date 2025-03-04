import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl6';
import { VersionableMixin } from 'Types/entity';

class CustomObject extends VersionableMixin {
    protected _value: string | null;
    constructor(value: string | null) {
        super();
        this._setValue(value);
    }

    get value(): string {
        return this._value;
    }

    set value(value: string | null) {
        if (this._value === value) {
            return;
        }
        this._setValue(value + '!');
        this._nextVersion();
    }

    protected _setValue(value: string | null): void {
        this._value = value;
    }
}
export default class ReactiveControl6 extends Control {
    _template: TemplateFunction = template;
    _value: CustomObject = new CustomObject('init value');

    protected _changeValue(): void {
        this._value.value = 'new value';
    }
}
