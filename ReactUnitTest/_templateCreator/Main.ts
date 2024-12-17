import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_templateCreator/Main';

export default class Main extends Control {
    _template: TemplateFunction = template;
}
