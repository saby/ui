import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!UIDemo/ReactDemo/InheritedOptions/Controller';

export default class Controller extends Control {
    protected _template: TemplateFunction = template;
    protected _themeName: string = 'testTheme';
    protected _readOnly: boolean = false;
    protected clickMe() {
        console.log('click click');
    }
}
