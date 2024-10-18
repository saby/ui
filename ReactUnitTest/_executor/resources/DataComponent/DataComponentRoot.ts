import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/DataComponent/DataComponentRoot';

export default class DataComponentRoot extends Control {
    _template: TemplateFunction = template;
}
