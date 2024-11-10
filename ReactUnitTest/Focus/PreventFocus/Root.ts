import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Focus/PreventFocus/Root';

export default class PreventFocusRoot extends Control {
    _template: TemplateFunction = template;
}
