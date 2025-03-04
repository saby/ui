import { Control } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_base/resources/WasabyUpdater/WasabyHooksQueue/NumberZero');

export default class NumberZero extends Control {
    protected _template: unknown = template;
    index: number = 0;
    // для мока
    _beforeMount(): void {
        return undefined;
    }
}
