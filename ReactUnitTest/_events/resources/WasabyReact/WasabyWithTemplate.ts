import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_events/resources/WasabyReact/WasabyWithTemplate');

export default class WasabyWithTemplate extends Control {
    readonly _template: TemplateFunction = template;
    value: number = 0;

    _onClick(): void {
        this.value = this.value + 1;
    }
}
