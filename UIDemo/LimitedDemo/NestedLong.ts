import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/LimitedDemo/NestedLong');
import INestedState from './INestedState';

class NestedLong extends Control<IControlOptions, INestedState> {
    _template: TemplateFunction = template;

    protected _state: boolean = false;
    private _timeOut: number = 5000;

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
NestedLong._styles = ['UIDemo/LimitedDemo/NestedLong'];

export default NestedLong;
