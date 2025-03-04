import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/ReactComponentCreator/Wasaby';
import rk from './rk';

export default class WasabyReactFn extends Control {
    protected _template: TemplateFunction = template;
    protected _rk: Function = rk;
}
