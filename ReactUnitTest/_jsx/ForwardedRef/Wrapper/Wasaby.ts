import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/ForwardedRef/Wrapper/Wasaby';

export default class Wasaby extends Control {
    protected _template: TemplateFunction = template;
}
