import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_beforeUnmountDecorator/Bottom';

export default class Bottom extends Control {
    _template: TemplateFunction = template;

    _beforeUnmount(): void {
        return;
    }
}
