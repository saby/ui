import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/AsyncChildDemo/Index/Child';

export default class Index extends Control {
    _template: TemplateFunction = template;
    _mounted: boolean = false;
    secondProp: number = 0;
    status: string = 'loading';
    statusColor: string = 'black';

    // @ts-ignore
    protected _beforeMount(): Promise<unknown> | void {
        return new Promise((resolve) => {
            // eslint-disable-next-line no-magic-numbers
            setTimeout(() => {
                return resolve({ data: 42, type: 'child' });
            }, 200);
        });
    }

    protected _afterMount(): void {
        this._mounted = true;
        this.status = 'mounted';
        this.statusColor = 'orange';
    }

    protected _beforeUpdate(options: { prop: number }): void {
        if (this._mounted && options.prop === 42) {
            this.status = 'OK';
            this.statusColor = 'green';
            this.secondProp = 42;
            return;
        }

        this.status = 'Error!';
        this.statusColor = 'red';
    }
}
