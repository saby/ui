import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/Generator/Empty';

export default class Empty extends Control {
    _template: TemplateFunction = template;

    getTemplate() {
        return this._template;
    }
}
