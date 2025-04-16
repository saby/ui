import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!UIDemo/PropsDemo/WasabyControl';

export default class WasabyControl extends Control {
    protected _template: TemplateFunction = template;
}
