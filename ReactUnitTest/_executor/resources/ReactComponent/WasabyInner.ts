import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/ReactComponent/WasabyInner';

export default class WasabyInner extends Control {
    _template: TemplateFunction = template;
}
