import { Record } from 'Types/entity';
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/BeforeUpdate/_observableOption/Child1';

interface IOptions extends IControlOptions {
    prefetchRecord: Record;
}

export default class ObservableChild1 extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected _record: Record;

    _beforeMount(): Promise<void> {
        this._record = new Record({
            rawData: {
                field: 'default',
                changeInChild: false,
            },
        });
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 5);
        });
    }

    _beforeUpdate(options: IOptions): void {
        if (options.prefetchRecord !== this._options.prefetchRecord) {
            this._record = options.prefetchRecord;
        }
    }
}
