import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/ReactComponent/WasabyInnerContent';

export default class WasabyInnerContent extends Control {
    _template: TemplateFunction = template;
}
