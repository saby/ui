import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/Compiler/_ref-container/ContainerRefChild';

export default class ContainerRefChild extends Control {
    _template: TemplateFunction = template;

    _beforeUpdate() {
        return new Promise((resolve) => {
            resolve(null);
        });
    }

    getContainer() {
        return this._container;
    }
}
