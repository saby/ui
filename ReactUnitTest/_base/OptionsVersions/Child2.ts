import { Record } from 'Types/entity';
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/OptionsVersions/Child2';

interface IOptions extends IControlOptions {
    record: Record;
}

export default class Child2 extends Control<IOptions> {
    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IOptions): void {
        options.record.set('field', 'child2');
    }
}
