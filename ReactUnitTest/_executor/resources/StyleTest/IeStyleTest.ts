import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/StyleTest/IeStyleTest';

export default class IeStyleTest extends Control {
    _template: TemplateFunction = template;
    protected gridColumns: number = 1;
}
