import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/InheritOptions/WithoutReadOnly';

export default class WithoutReadOnly extends Control {
    _template: TemplateFunction = template;
}
