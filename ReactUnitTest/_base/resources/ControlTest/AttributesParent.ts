import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/AttributesParent';

interface IParentOptions {
    value: number;
    constructor: () => void;
}

export default class AttributesParent extends Control {
    _template: TemplateFunction = template;
    parentOptions: IParentOptions = {
        value: 1,
        constructor: () => {
            return;
        },
    };
}
