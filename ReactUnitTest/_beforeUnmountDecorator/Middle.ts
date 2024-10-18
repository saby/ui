import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_beforeUnmountDecorator/Middle';

export default class Middle extends Control {
    _template: TemplateFunction = template;

    _beforeUnmount(): void {
        return;
    }
}
