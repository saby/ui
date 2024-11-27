import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/ContentOptions/resources/Child');

export default class Child extends Control {
    protected _template: TemplateFunction = template;
}
