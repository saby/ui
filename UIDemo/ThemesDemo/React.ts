import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/ThemesDemo/React';

export default class Index extends Control {
    _template: TemplateFunction = template;
    static _theme = ['UIDemo/ThemesDemo/React'];
    static _styles: string[] = ['UIDemo/Index'];

    protected _beforeMount(): Promise<any> | void {
        return new Promise((resolve) => {
            // eslint-disable-next-line no-magic-numbers
            resolve(42);
        });
    }
}
