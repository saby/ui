import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithReactiveModel2';
import { IViewModelData } from './interface';

export default class ControlWithReactiveModel2 extends Control {
    _template: TemplateFunction = template;
    protected _model: IViewModelData;
    protected _value: string = 'init';

    protected _beforeMount(options): void {
        this._model = options._model;
    }

    protected _beforeUpdate(): void {
        const currentDisplayValue: string = this._model.displayValue;
        if (this._model.oldValue !== currentDisplayValue) {
            this._value = 'changed';
        }
    }

    protected _startReactive(event: Event, newValue: string): void {
        if (this._model.changeValue(newValue)) {
            this._notify('valueChanged', [this._model.value, this._model.displayValue], {
                bubbling: true,
            });
        }
    }
}
