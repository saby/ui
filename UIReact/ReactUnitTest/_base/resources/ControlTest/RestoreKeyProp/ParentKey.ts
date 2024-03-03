import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/RestoreKeyProp/ParentKey';

export default class ParentKey extends Control {
    _template: TemplateFunction = template;
    _key: string = null;
}
