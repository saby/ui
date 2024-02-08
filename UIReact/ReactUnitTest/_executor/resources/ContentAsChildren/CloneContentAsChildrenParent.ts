import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/CloneContentAsChildrenParent');

export default class CloneContentAsChildrenParent extends Control {
    protected _template: TemplateFunction = template;
}
