import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_beforeUnmountDecorator/Main';

export default class Main extends Control {
    _template: TemplateFunction = template;
    value: Boolean = true;

    _beforeUnmount(): void {
        return;
    }
}
