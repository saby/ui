import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/UncommonAttrs/Target/WasabyWithLinkReact');

export default class LinkWasaby extends Control {
    protected _template: TemplateFunction = template;
}
