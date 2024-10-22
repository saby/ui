import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/LimitedDemo/Nested');
import INestedState from './INestedState';

class Nested extends Control<IControlOptions, INestedState> {
    _template: TemplateFunction = template;

    protected _state: boolean = false;
    private _timeOut: number = 19000;

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
Nested._styles = ['UIDemo/LimitedDemo/Nested'];

export default Nested;
