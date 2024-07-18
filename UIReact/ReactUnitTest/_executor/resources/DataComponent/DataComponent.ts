import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/DataComponent/DataComponent';

export default class DataComponent extends Control {
    _template: TemplateFunction = template;
}
