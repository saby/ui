import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/RestoreKeyProp/ChildKey';

export default class ChildKey extends Control {
    _template: TemplateFunction = template;
    keyValue: string = 'no key';

    protected _beforeMount(options: { key: unknown }): void {
        if (options.key === null) {
            this.keyValue = 'null key';
        }
        if (options.key === 0) {
            this.keyValue = '0 key';
        }
        if (options.key) {
            this.keyValue = 'normal key: ' + options.key;
        }
    }
}
