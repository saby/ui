import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/ReactComponent/WasabyRoot';

export default class WasabyRoot extends Control {
    _template: TemplateFunction = template;
}
