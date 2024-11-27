import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';

import template = require('wml!ReactUnitTest/_base/resources/ControlTest/ServiceFields/ServiceFieldsChild');

export default class ServiceFieldsChild extends Control {
    readonly _template: TemplateFunction = template;
}
