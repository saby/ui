/// <amd-module name="UIDemo/AsyncChildDemo/Index" />

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!UIDemo/AsyncChildDemo/Index/Index';

export default class Index extends Control {
    _template: TemplateFunction = template;
    prop: number = 0;

    // @ts-ignore
    protected _beforeMount(): Promise<unknown> | void {
        return new Promise((resolve) => {
            // tslint:disable-next-line:no-magic-numbers
            setTimeout(() => resolve({data: 42, type: 'parent'}), 200);
        });
    }

    protected _afterMount(): void {
        this.prop = 42;
    }
}
