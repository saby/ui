import { TemplateFunction, Control, IControlChildren } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NameUpperThenContentOption/ContentOptionUser';

interface IContentOptionUserChildren extends IControlChildren {
    child: Control;
}

export default class ContentOptionUser extends Control {
    _template: TemplateFunction = template;
    _children: IContentOptionUserChildren;
    getChild(): Control {
        return this._children.child;
    }
}
