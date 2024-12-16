import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithInvisible';

export default class ControlWithInvisible extends Control {
    _template: TemplateFunction = template;
    show: boolean = false;

    protected _afterMount(): void {
        this.show = true;
    }
}
