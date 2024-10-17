import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/RestoreKeyProp/ParentKey';

export default class ParentKey extends Control {
    _template: TemplateFunction = template;
    hasOwnKey: string;
    _beforeMount(options: IControlOptions): void {
        this.hasOwnKey = '' + options.hasOwnProperty('key');
    }
}
