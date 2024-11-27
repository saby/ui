import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/EmptyRoot/EmptyTemplate';

export default class EmptyTemplate extends Control {
    _template: TemplateFunction = template;
}
