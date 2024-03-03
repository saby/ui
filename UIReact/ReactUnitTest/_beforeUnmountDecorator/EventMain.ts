import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_beforeUnmountDecorator/EventMain';

export default class EventMain extends Control {
    _template: TemplateFunction = template;
    value: Boolean = true;
    catched: Boolean = false;

    _customEventHandler(): void {
        this.catched = true;
    }
}
