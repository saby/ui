import { Control } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_base/resources/WasabyUpdater/WasabyHooksQueue/NumberTwo');

export default class NumberTwo extends Control {
    protected _template: unknown = template;
    index: number = 2;
    // для мока
    _beforeMount(): void {
        return undefined;
    }
}
