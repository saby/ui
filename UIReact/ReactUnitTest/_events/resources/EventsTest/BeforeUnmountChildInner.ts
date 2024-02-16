import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/BeforeUnmountChildInner';

export default class BeforeUnmountChildInner extends Control {
    _template: TemplateFunction = template;
    value: number = 0;

    addValue(): void {
        this.value += 1;
    }

    _beforeUnmount(): void {
        this._notify('childUnmount', [], { bubbling: true });
    }
}
