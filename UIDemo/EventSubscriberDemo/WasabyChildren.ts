import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventSubscriberDemo/WasabyChildren';

export default class WasabyChildren extends Control {
    _template: TemplateFunction = template;

    handler() {
        this._notify('bubblingEvent', [], { bubbling: true });
    }
}
