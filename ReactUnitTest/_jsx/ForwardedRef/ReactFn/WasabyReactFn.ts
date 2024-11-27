import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/ForwardedRef/ReactFn/WasabyReactFn';

export default class WasabyReactFn extends Control {
    protected _template: TemplateFunction = template;
    protected _hasContainer: boolean = false;

    protected _afterMount() {
        this._hasContainer = !!this._container;
    }
}
