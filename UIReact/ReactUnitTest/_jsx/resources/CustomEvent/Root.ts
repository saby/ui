import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!ReactUnitTest/_jsx/resources/CustomEvent/Root';

export default class Root extends Control {
    protected _template: TemplateFunction = template;
}
