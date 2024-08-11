import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlWithBind';

export default class ControlWithBind extends Control {
    _template: TemplateFunction = template;
}
