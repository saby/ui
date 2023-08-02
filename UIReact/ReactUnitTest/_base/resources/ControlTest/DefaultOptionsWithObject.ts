import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/DefaultOptionsWithObject';

export default class DefaultOptionsWithObject extends Control {
    _template: TemplateFunction = template;
    static getDefaultOptions(): object {
        return {
            obj: {
                value: 'test',
            },
        };
    }
}
