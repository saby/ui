import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/ForwardedRef/Wrapper/WasabyWrapper';

export default class WasabyWrapper extends Control {
    protected _template: TemplateFunction = template;
    protected _hasContainer: boolean = false;

    protected _afterMount() {
        this._hasContainer = !!this._container;
    }
}
