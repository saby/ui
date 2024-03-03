import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/ColumnAsync/Template/WsPartial');

export default class WsPartial extends Control {
    protected _template: TemplateFunction = template;
    protected _isOpen: boolean = false;

    protected _setOpen(): void {
        this._isOpen = !this._isOpen;
        this._forceUpdate();
    }

    static _styles: string[] = ['UIDemo/AsyncControls/AsyncTestDemo'];
}
