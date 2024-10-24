import { Control, TemplateFunction } from 'UI/Base';
import Child from 'ReactUnitTest/ContentOptions/resources/Child';
import template = require('wml!ReactUnitTest/ContentOptions/resources/Index');

export default class Index extends Control {
    protected _template: TemplateFunction = template;
    protected _child: {} = Child;
    protected _controlOptions: {} = { fromIndex: { key: 'value' } };
}
