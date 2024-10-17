import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_shouldComponentUpdate/Container';

export default class Container extends Control {
    _template: TemplateFunction = template;
    aaa: number = 0;
}
