import { Control, IControlChildren, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/ControlWithContentBind/Top';
import Bottom from './Bottom';

interface ControlWithBindChildren extends IControlChildren {
    bottom: Bottom;
}
export default class ControlWithBind extends Control {
    _children: ControlWithBindChildren;
    _template: TemplateFunction = template;
}
