import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/DefaultOptionsWithObjectChild';

export default class DefaultOptionsWithObjectChild extends Control {
    _template: TemplateFunction = template;
}
