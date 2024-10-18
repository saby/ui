import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/EmptyRoot/Wrapper';

export default class Wrapper extends Control {
    _template: TemplateFunction = template;
}
