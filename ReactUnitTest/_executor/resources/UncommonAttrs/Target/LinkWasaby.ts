import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/UncommonAttrs/Target/LinkWasaby');

// target только для tsx, не должен использоваться в шаблоне.
interface ILinkWasabyOptions extends IControlOptions {
    target: string;
    href: string;
}

export default class LinkWasaby extends Control<ILinkWasabyOptions> {
    protected _template: TemplateFunction = template;
}
