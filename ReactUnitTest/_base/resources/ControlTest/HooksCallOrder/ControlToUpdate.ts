import { TemplateFunction } from 'UICommon/Base';
import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/HooksCallOrder/ControlToUpdate';

export default class ControlToUpdate extends Control {
    protected _template: TemplateFunction = template;
}
