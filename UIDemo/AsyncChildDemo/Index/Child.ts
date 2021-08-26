/// <amd-module name="UIDemo/AsyncChildDemo/Index/Child" />

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!UIDemo/AsyncChildDemo/Index/Child';

export default class Index extends Control {
    _template: TemplateFunction = template;
    _mounted: boolean = false;

    // @ts-ignore
    protected _beforeMount(): Promise<unknown> | void {
        return new Promise((resolve) => {
            // tslint:disable-next-line:no-magic-numbers
            setTimeout(() => resolve({data: 42, type: 'child'}), 200);
        });
    }

    protected _afterMount(): void {
        this._mounted = true;
    }

    protected _beforeUpdate(): void {
        debugger;
    }
}
