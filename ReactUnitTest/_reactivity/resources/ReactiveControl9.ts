import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl9';

export default class ReactiveControl9 extends Control {
    _template: TemplateFunction = template;
    valueArray: string[] = ['init value 1'];

    protected _pushToArray(): void {
        this.valueArray.push('init value 2');
    }
}
