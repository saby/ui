import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/WasabyReact/PlatformControl';

export default class PlatformControl extends Control {
    _template: TemplateFunction = template;

    clickHandler() {
        this._notify('mySuperEvent');
    }
}
