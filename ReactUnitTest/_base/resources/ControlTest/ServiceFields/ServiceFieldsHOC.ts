import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';

import template = require('wml!ReactUnitTest/_base/resources/ControlTest/ServiceFields/ServiceFieldsHOC');

export default class ServiceFieldsHOC extends Control {
    readonly _template: TemplateFunction = template;
}
