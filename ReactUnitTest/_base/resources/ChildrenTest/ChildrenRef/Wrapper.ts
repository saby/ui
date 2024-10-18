import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Wrapper';

export default class Wrapper extends Control {
    _template: TemplateFunction = template;

    getChild(): Control {
        return this._children.MyControl as Control;
    }
}
