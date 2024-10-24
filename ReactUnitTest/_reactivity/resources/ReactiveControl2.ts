import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl2';

let timer: number = 0;
export default class ReactiveControl2 extends Control {
    _template: TemplateFunction = template;
    value: string = 'init value';

    // Если не выключать реактивность на время _beforeUpdate,
    // такой код вызовет бесконечную перерисовку.
    _beforeUpdate(): void {
        this.value = `${this.value} ${timer++}`;
    }

    protected _changeValue(): void {
        this.value = 'new value';
    }
}
