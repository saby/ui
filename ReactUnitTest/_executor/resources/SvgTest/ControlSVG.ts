import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/SvgTest/ControlSVG';

export default class ControlSVG extends Control {
    _template: TemplateFunction = template;
}
