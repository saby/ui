import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_react/OnCompatiblePage/Root';

export default class Root extends Control {
    _template: TemplateFunction = template;
    _showReactControl: boolean = false;
    _showWs3Control: boolean = false;

    toggleReactControl(): void {
        this._showReactControl = !this._showReactControl;
    }

    toggleWs3Control(): void {
        this._showWs3Control = !this._showWs3Control;
    }
}
