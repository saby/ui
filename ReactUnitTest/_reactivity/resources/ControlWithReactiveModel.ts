import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithReactiveModel';
import { IViewModelData } from './interface';
import { ViewModel } from './ViewModel';

export default class ControlWithReactiveModel extends Control {
    _template: TemplateFunction = template;
    protected _viewModel: IViewModelData = new ViewModel('init model');

    protected _beforeUpdate(options): void {
        this._viewModel.oldValue = this._viewModel.displayValue;
        const newValue = this._getValue(options);
        if (this._viewModel.value !== newValue) {
            this._viewModel.value = newValue;
        }
    }

    protected _valueChangedProxy() {
        this._notify('valueChanged', [
            this._viewModel.value,
            this._viewModel.displayValue,
        ]);
    }

    protected _getValue(options): string {
        if (options.hasOwnProperty('value')) {
            return options.value === undefined ? '' : options.value;
        }
        if (this._viewModel) {
            return this._viewModel.value;
        }
        return '';
    }
}
