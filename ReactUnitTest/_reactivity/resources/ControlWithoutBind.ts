import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithoutBind';

export default class ControlWithoutBind extends Control {
    _template: TemplateFunction = template;
}
