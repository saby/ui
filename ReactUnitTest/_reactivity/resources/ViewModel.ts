import { VersionableMixin } from 'Types/entity';

export class ViewModel<TOptions extends {} = {}> extends VersionableMixin {
    protected _value: string | null;
    protected _displayValue: string;

    oldValue: string = '';

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

    get displayValue(): string {
        return this._displayValue;
    }

    set displayValue(displayValue: string) {
        if (this._displayValue === displayValue) {
            return;
        }
        this._setValue(displayValue);
        this._nextVersion();
    }

    protected _setValue(value: string | null): void {
        this._displayValue = value;
        this._value = value;
    }

    changeValue(newValue: string): boolean {
        const displayValueChanged: boolean = this.displayValue !== newValue;

        if (displayValueChanged) {
            this._setValue(newValue);
            this._nextVersion();
        }

        return displayValueChanged;
    }
}
