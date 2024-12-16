import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/UniqueRskey/WasabyChild';

export default class WasabyChild extends Control {
    protected _template: TemplateFunction = template;
}
