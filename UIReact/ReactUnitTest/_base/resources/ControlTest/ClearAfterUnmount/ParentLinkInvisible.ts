import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ClearAfterUnmount/ParentLinkInvisible';

export default class ParentLinkInvisible extends Control {
    _template: TemplateFunction = template;
}
