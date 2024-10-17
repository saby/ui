import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/OptionsVersions/Child1';

export default class Child1 extends Control {
    protected _template: TemplateFunction = template;
}
