import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdateReactiveDuringAsyncMount/Bottom';

export default class Bottom extends Control {
    _template: TemplateFunction = template;

    protected _beforeMount(): Promise<void> | void {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 20);
        });
    }
}
