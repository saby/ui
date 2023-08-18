import { Control, TemplateFunction } from 'UI/Base';
// @ts-ignore
import * as template from 'wml!UIDemo/ReactDemo/Index';

export default class Index extends Control {
    protected _template: TemplateFunction = template;
    protected clickMe() {
        // eslint-disable-next-line no-console
        console.log('was clicked');
    }
}
