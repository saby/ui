import { Control, TWasabyOverReactProps } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/DivContent');

interface IDivContentProps extends TWasabyOverReactProps {
    allowPatchContent: boolean;
}

export default class DivContent extends Control<IDivContentProps> {
    protected _template = template;
}
