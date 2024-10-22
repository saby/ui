import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdateReactiveDuringAsyncMount/Top';

export default class Top extends Control {
    _template: TemplateFunction = template;
    _value: number = 0;

    protected _beforeMount(): Promise<void> | void {
        setTimeout(() => {
            this._value = 1;
        }, 10);
    }
}
