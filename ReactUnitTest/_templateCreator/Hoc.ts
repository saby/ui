import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_templateCreator/Hoc';

export default class Hoc extends Control {
    _template: TemplateFunction = template;
}
