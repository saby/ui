import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!ReactUnitTest/_jsx/resources/WasabyReact/Root';

export default class Root extends Control {
    protected _template: TemplateFunction = template;
    protected _forBind: string = 'init';
}
