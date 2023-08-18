import { Control, IControlOptions, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/LimitedDemo/NestedLongOther');
import INestedState from './INestedState';

class NestedLongOther extends Control<IControlOptions, INestedState> {
    _template: TemplateFunction = template;

    protected _state: boolean = false;
    private _timeOut: number = 1000;

    _beforeMount(): Promise<INestedState> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._state = true;
                resolve({ _state: true });
            }, this._timeOut);
        });
    }
}

// @ts-ignore
NestedLongOther._styles = ['UIDemo/LimitedDemo/NestedLongOther'];

export default NestedLongOther;
