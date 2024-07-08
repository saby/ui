import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/StyleTest/NormalStyleTest';

export default class NormalStyleTest extends Control {
    _template: TemplateFunction = template;
    protected gridColumns: number = 1;
}
