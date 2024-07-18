import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!ReactUnitTest/_jsx/resources/WasabyReact/Wasaby';

export default class Wasaby extends Control {
    protected _template: TemplateFunction = template;

    handler() {
        this._notify('valueChanged', [
            'bind handler ' + this._options.additionName,
        ]);
    }
}
