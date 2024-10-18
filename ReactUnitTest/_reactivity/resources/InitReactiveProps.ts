import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/InitReactiveProps';

export default class InitReactiveProps extends Control {
    _template: TemplateFunction = template;
    value: string = '';
    value2: string = '';
}
