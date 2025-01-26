import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/AlreadyReactive/AlreadyChild';

export default class AlreadyChild extends Control {
    _template: TemplateFunction = template;
    record: unknown = {};

    protected _beforeMount(options: { record: unknown }): void {
        this.record = options.record;
    }
}
