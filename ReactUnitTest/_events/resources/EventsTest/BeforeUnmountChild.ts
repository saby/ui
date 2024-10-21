import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/BeforeUnmountChild';

export default class BeforeUnmountChild extends Control {
    _template: TemplateFunction = template;
    showInner: boolean = true;

    _hideHandler(): void {
        this.showInner = false;
    }
}
