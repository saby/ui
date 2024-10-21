import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl3';
import * as template2 from 'wml!ReactUnitTest/_reactivity/resources/ReactiveControl3New';

export default class ReactiveControl3 extends Control {
    _template: TemplateFunction = template;
    valueOne: string = 'template 1';
    valueTwo: string = 'template 2';

    protected _changeTemplate(): void {
        this._template = template2;
    }

    protected _changeValueOne(): void {
        this.valueOne = 'template 1 changed';
    }

    protected _changeValueTwo(): void {
        this.valueTwo = 'template 2 changed';
    }
}
