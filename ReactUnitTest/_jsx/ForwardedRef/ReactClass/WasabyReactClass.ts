import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/ForwardedRef/ReactClass/WasabyReactClass';

export default class WasabyReactClass extends Control {
    protected _template: TemplateFunction = template;
    protected _hasContainer: boolean = false;

    protected _afterMount() {
        this._hasContainer = !!this._container;
    }
}
