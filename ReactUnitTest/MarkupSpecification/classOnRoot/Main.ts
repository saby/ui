import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/MarkupSpecification/classOnRoot/Main';

export default class Main extends Control {
    _template: TemplateFunction = template;
}
