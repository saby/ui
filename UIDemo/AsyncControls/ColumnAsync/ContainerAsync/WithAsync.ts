import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/ColumnAsync/ContainerAsync/WithAsync');

export default class WithAsync extends Control {
    protected _template: TemplateFunction = template;
    protected _isOpen: boolean = false;

    protected _setOpen(): void {
        this._isOpen = !this._isOpen;
        this._forceUpdate();
    }

    static _styles: string[] = ['UIDemo/AsyncControls/AsyncTestDemo'];
}
