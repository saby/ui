import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!ReactUnitTest/_jsx/resources/CustomEvent/WasabyControl';

export default class WasabyControl extends Control {
    protected _template: TemplateFunction = template;

    protected _afterMount(): void {
        this._notify('myevent', ['newValue']);
    }
}
