import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/ReactComponent/WithForwardRefParent';

export default class WithForwardRefParent extends Control {
    _template: TemplateFunction = template;
}
