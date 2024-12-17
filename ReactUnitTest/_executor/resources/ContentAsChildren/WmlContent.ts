import { Control, TWasabyOverReactProps } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/WmlContent');

interface IWmlContentProps extends TWasabyOverReactProps {
    allowPatchContent: boolean;
}

export default class WmlContent extends Control<IWmlContentProps> {
    protected _template = template;
}
