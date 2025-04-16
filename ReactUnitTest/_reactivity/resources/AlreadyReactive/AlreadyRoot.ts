import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/AlreadyReactive/AlreadyRoot';
import { VersionableMixin } from 'Types/entity';

class CustomObject extends VersionableMixin {
    protected _value: number | null;
    constructor(value: number | null) {
        super();
        this._setValue(value);
    }

    get value(): number {
        return this._value;
    }

    set value(value: number | null) {
        if (this._value === value) {
            return;
        }
        this._setValue(value);
        this._nextVersion();
    }

    protected _setValue(value: number | null): void {
        this._value = value;
    }
}

export default class AlreadyRoot extends Control {
    _template: TemplateFunction = template;
    recObject: CustomObject = new CustomObject(0);
    showChild: boolean = false;

    toggleChild(): void {
        this.showChild = !this.showChild;
    }

    changeRecObject(): void {
        this.recObject.value += 1;
    }
}
