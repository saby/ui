import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_proxyChildren/RootDownChlidren';

interface IRootDownChlidrenOptions extends IControlOptions {
    resolveAfterMount: (instance: RootDownChlidren) => void;
}

export default class RootDownChlidren extends Control<IRootDownChlidrenOptions> {
    protected _template: TemplateFunction = template;
    protected _value: number = 1;
    upValue() {
        this._value++;
    }
    _afterMount(): void {
        this._options.resolveAfterMount(this);
    }
}
