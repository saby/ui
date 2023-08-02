import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_getChangedOptions/WasabyControl2';

export default class TestControl extends Control {
    value: any;
    _template: TemplateFunction = template;

    protected _beforeMount(
        options?: { value: any },
        contexts?: object,
        receivedState?: void
    ): Promise<void> | void {
        this.value = options.value;
        return super._beforeMount(options, contexts, receivedState);
    }
}
