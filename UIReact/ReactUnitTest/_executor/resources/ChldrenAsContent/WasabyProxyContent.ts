import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabyProxyContent');

export default class WasabyProxyContent extends Control {
    protected _template: TemplateFunction = template;
}