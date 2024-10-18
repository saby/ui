import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/InheritOptions/WithReadOnly';

export default class WithReadOnly extends Control {
    _template: TemplateFunction = template;
}
