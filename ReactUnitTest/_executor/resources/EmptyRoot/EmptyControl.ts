import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/EmptyRoot/EmptyControl';

export default class EmptyControl extends Control {
    _template: TemplateFunction = template;
}
