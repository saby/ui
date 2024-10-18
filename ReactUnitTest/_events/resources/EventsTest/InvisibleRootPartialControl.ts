import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/InvisibleRootPartialControl';

export default class InvisibleRootPartialControl extends Control {
    _template: TemplateFunction = template;
    value: string = 'init';

    _innerClick(): void {
        this.value = 'inner';
    }
}
