import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/NotifyDemo/Root';

export default class Root extends Control {
    protected _template: TemplateFunction = template;
    protected _val: string[] = [];
    protected _valCount: number = 0;

    handler(_, val) {
        this._valCount += 1;
        this._val.push(val);
    }
}
