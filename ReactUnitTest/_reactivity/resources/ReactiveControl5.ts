import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl5';

export default class ReactiveControl5 extends Control {
    _template: TemplateFunction = template;
    valueObject: { _version: number; value: string } = {
        _version: 0,
        value: 'init value',
    };

    protected _nextVersion(): void {
        this.valueObject._version++;
    }
}
