import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventSubscriberDemo/OtherReactControl';

export default class OtherReactControl extends Control {
    _template: TemplateFunction = template;

    handler() {
        this._notify('bubblingEvent', [], { bubbling: true });
    }
}
