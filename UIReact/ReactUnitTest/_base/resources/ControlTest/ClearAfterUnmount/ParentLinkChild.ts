import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ClearAfterUnmount/ParentLinkChild';

export default class ParentLinkChild extends Control {
    _template: TemplateFunction = template;
}
