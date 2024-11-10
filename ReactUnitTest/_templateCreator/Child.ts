import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_templateCreator/Child';

export default class Child extends Control {
    _template: TemplateFunction = template;
    updated = 0;
    _beforeUpdate() {
        this.updated++;
    }
}
