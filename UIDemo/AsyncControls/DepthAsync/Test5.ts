import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/DepthAsync/Test5');

export default class Test5 extends Control {
    protected _template: TemplateFunction = template;
    protected _isGrid: boolean = true;
    protected _readOnly: boolean = false;

    protected _setGridState(): void {
        this._isGrid = !this._isGrid;
        this._forceUpdate();
    }
    protected _setReadState(): void {
        this._readOnly = !this._readOnly;
        this._forceUpdate();
    }

    static _styles: string[] = [
        'UIDemo/AsyncControls/AsyncTestDemo',
        'UIDemo/AsyncControls/DepthAsync/Depth',
    ];
}