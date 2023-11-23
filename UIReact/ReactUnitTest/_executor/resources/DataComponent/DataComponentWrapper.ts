import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/DataComponent/DataComponentWrapper';

export default class DataComponentWrapper extends Control {
    _template: TemplateFunction = template;
}
