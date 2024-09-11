import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/ForceUpdate/Parent';

export default class Parent extends Control {
    protected _template: TemplateFunction = template;
    protected _reactiveOption: number = 0;

    changeReactiveOption(): void {
        this._reactiveOption = this._reactiveOption + 1;
    }
}
