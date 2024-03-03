import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/LimitedDemo/Simple');
import INestedState from './INestedState';

class Simple extends Control<IControlOptions, INestedState> {
    _template: TemplateFunction = template;

    protected _state: boolean = false;
    private _timeOut: number = 500;
    protected _actionClick: number = 0;

    _beforeMount(): Promise<INestedState> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._state = true;
                resolve({ _state: true });
            }, this._timeOut);
        });
    }

    _actionHandler() {
        this._actionClick++;
    }
}

// @ts-ignore
Simple._styles = ['UIDemo/LimitedDemo/Simple'];

export default Simple;
