import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/NotifyDemo/WasabyControlHOC';

export default class WasabyControlHOC extends Control {
    protected _template: TemplateFunction = template;
    protected _val: number = 0;

    constructor(a, b) {
        super(a, b);
        this._onChildDidMount = this._onChildDidMount.bind(this);
        this._changeVal = this._changeVal.bind(this);
    }

    _onChildDidMountOld(_e, val) {
        this._notify('childMounted', [val]);
    }

    _onChildDidMount(val) {
        this._notify('childMounted', [val]);
    }

    _changeVal() {
        this._val += 1;
    }
}
