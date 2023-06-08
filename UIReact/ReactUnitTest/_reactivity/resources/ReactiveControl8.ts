import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl8';
import { VersionableMixin } from 'Types/entity';

class VersionableObject extends VersionableMixin {
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
        this._setValue(value);
        this._nextVersion();
    }

    protected _setValue(value: string | null): void {
        this._value = value;
    }
}

export default class ReactiveControl8 extends Control {
    _template: TemplateFunction = template;
    valueObject: VersionableObject = new VersionableObject('init value');

    protected _changeValue(): void {
        this.valueObject.value = 'change value';
    }
}
