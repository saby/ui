import { Control } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_base/resources/WasabyUpdater/WasabyHooksQueue/NumberThree');

export default class NumberThree extends Control {
    protected _template: unknown = template;
    index: number = 3;
    // для мока
    _beforeMount(): void {
        return undefined;
    }
}
