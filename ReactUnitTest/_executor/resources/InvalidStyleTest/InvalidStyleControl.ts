import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/InvalidStyleTest/InvalidStyleControl';

export default class InvalidStyleControl extends Control {
    _template: TemplateFunction = template;
    protected maxWidth: number = 120;
    resetMaxWidth(): void {
        this.maxWidth = undefined;
    }
}
