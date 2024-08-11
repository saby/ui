import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/DefaultOptionsWithObjectParent';

export default class DefaultOptionsWithObjectParent extends Control {
    _template: TemplateFunction = template;
    value: string = '0';
    setNewValue = () => {
        this.value = '1';
    };
}
