import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/SomeWasabyWithContent');

export default class SomeWasabyWithContent extends Control {
    protected _template: TemplateFunction = template;
}
