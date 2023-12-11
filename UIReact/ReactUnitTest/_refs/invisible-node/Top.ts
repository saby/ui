import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_refs/invisible-node/Top';

export default class Top extends Control {
    protected _template: TemplateFunction = template;
    valueToCheck: string;
    valueToUpdate: number;

    eventHandler = () => {
        this.valueToCheck = 'catch';
    };
}
