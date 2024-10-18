import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/Touch/Child';

export default class Child extends Control {
    _template: TemplateFunction = template;
    trigger: boolean = false;
    clickHandler(e: Event): void {
        this.trigger = !this.trigger;
    }
}
