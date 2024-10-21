import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl';

export default class ReactiveControl extends Control {
    _template: TemplateFunction = template;
    value: string = 'init value';

    protected _changeValue(): void {
        this.value = 'new value';
    }
}
