import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_refs/invisible-node/Middle';

export default class Middle extends Control {
    protected _template: TemplateFunction = template;
}
