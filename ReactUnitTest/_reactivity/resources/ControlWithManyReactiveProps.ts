import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithManyReactiveProps';

export default class ControlWithManyReactiveProps extends Control {
    _template: TemplateFunction = template;
    protected value: string = 'init value';
    protected value1: string = 'init value 1';
    protected value2: string = 'init value 2';

    protected _startReactive(): void {
        this.value = 'change value';
        this.value1 = 'change value 1';
        this.value2 = 'change value 2';
    }
}
