import { Control, TWasabyOverReactProps } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/TemplateContent');

interface ITemplateContentProps extends TWasabyOverReactProps {
    allowPatchContent: boolean;
}

export default class TemplateContent extends Control<ITemplateContentProps> {
    protected _template = template;
}
