import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_jsx/ForwardedRef/Wrapper/WasabyReactFn';

export default class WasabyReactFn extends Control {
    protected _template: TemplateFunction = template;
}
