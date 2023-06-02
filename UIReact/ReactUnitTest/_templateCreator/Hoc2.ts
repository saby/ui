import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_templateCreator/Hoc2';

export default class Hoc2 extends Control {
    _template: TemplateFunction = template;
}
