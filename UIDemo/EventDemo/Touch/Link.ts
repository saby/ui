import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/Touch/Link';

export default class Root extends Control {
    _template: TemplateFunction = template;
    _blockEvent(e: Event): void {
        e.preventDefault();
    }
}
