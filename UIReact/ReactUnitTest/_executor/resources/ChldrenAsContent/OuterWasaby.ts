import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/OuterWasaby');

export default class OuterWasaby extends Control<{ className?: string }> {
    protected _template: TemplateFunction = template;
}
