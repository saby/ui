import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/NotifyDemo/WasabyOriginalControl';

export default class SomeControl extends Control {
    protected _template: TemplateFunction = template;

    handleClick() {
        this._notify('changeVal');
    }

    _afterMount() {
        this._notify('childMounted', ['Wasaby MyComponent']);
    }
}
