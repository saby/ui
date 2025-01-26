import { Control, TWasabyOverReactProps } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/ControlContent');

interface IControlContentProps extends TWasabyOverReactProps {
    allowPatchContent: boolean;
}

export default class ControlContent extends Control<IControlContentProps> {
    protected _template = template;
}
