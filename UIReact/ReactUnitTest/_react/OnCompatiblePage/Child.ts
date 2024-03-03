import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_react/OnCompatiblePage/Child';

export default class Child extends Control {
    _template: TemplateFunction = template;
}
