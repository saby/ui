import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/Child';

export default class Child extends Control {
    _template: TemplateFunction = template;

    protected _beforeMount(options?: {}): Promise<void> | void {
        options.callback();
    }
}
