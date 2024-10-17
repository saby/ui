import { Control, TemplateFunction } from 'UI/Base';
import { Record } from 'Types/entity';
import * as template from 'wml!ReactUnitTest/_base/BeforeUpdate/_observableOption/Parent';

export default class ObservableParent extends Control {
    protected _template: TemplateFunction = template;

    protected _prefetchRecord: Record;

    protected _beforeMount(): void {
        setTimeout(() => {
            this._prefetchRecord = new Record({
                rawData: {
                    field: 'updated',
                },
            });
        }, 10);
    }
}
