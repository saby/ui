import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl10';

export default class ReactiveControl10 extends Control {
    _template: TemplateFunction = template;
    value: string = 'init';
    displayValue: string = 'init';
    position: number = 0;

    protected _inputHandler(event: Event): void {
        const field: HTMLInputElement = event.target as HTMLInputElement;
        const newValue = field.value;
        let displayValue = newValue;

        this.position = field.selectionStart;
        while (displayValue.length < 5) {
            displayValue = displayValue + '0';
        }
        this.displayValue = displayValue;
        field.value = newValue;
        field.setSelectionRange(this.position, this.position);
    }

    protected _blurHandler(): void {
        const field: HTMLInputElement = event.target as HTMLInputElement;
        this.value = field.value;
        field.value = this.displayValue;
    }
}
