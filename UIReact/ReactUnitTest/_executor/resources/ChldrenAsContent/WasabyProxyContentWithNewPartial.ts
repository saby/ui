import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabyProxyContentWithNewPartial');

export default class WasabyProxyContentWithNewPartial extends Control {
    protected _template: TemplateFunction = template;
}