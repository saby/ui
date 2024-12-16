import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/Compiler/_ref-container/InlineOptRoot';

export default class InlineOptRoot extends Control {
    _template: TemplateFunction = template;

    getContainer() {
        return this._container;
    }
}
