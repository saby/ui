import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_beforeUnmountDecorator/EventMiddle';

export default class EventMiddle extends Control {
    _template: TemplateFunction = template;
    catched: Boolean = false;

    _customEventHandler(): void {
        this.catched = true;
    }
}
