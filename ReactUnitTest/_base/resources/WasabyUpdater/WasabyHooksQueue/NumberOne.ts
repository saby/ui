import { Control } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_base/resources/WasabyUpdater/WasabyHooksQueue/NumberOne');

export default class NumberOne extends Control {
    protected _template: unknown = template;
    index: number = 1;
    // для мока
    _beforeMount(): void {
        return undefined;
    }
}
