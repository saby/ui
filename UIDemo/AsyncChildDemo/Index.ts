import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/AsyncChildDemo/Index/Index';
import 'css!UIDemo/AsyncChildDemo/Index/Index';

export default class Index extends Control {
    _template: TemplateFunction = template;
    status: string = 'loading';
    prop: number = 0;

    // @ts-ignore
    protected _beforeMount(): Promise<unknown> | void {
        return new Promise((resolve) => {
            // eslint-disable-next-line no-magic-numbers
            setTimeout(() => {
                return resolve({ data: 42, type: 'parent' });
            }, 200);
        });
    }

    protected _afterMount(): void {
        this.status = 'mounted';
        this.prop = 42;
    }
}
