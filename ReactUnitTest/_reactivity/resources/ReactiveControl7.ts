import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl7';

export default class ReactiveControl7 extends Control {
    _template: TemplateFunction = template;
    value: string = 'init value';

    protected _changeValue(): void {
        this.value = 'new value';
    }
}
