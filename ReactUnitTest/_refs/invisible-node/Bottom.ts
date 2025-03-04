import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_refs/invisible-node/Bottom';

export default class Bottom extends Control {
    protected _template: TemplateFunction = template;
}
