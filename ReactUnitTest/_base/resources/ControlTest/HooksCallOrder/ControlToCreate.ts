import { TemplateFunction } from 'UICommon/Base';
import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/HooksCallOrder/ControlToCreate';

export default class ControlToCreate extends Control {
    protected _template: TemplateFunction = template;
}
