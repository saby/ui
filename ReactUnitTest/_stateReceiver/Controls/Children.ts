import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_stateReceiver/Controls/Children';

export default class Children extends Control<IControlOptions> {
    _template: TemplateFunction = template;

    getReceivedStateKey(): string {
        return this._options?.rskey;
    }
}
