import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!UIDemo/EventDemo/WasabyReact/Root';

export default class Root extends Control {
    protected _template: TemplateFunction = template;
}
