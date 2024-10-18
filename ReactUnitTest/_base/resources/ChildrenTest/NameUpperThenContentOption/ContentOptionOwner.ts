import { TemplateFunction, Control, IControlChildren } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NameUpperThenContentOption/ContentOptionOwner';
import ContentOptionControl from './ContentOptionControl';
import type ContentOptionUser from './ContentOptionUser';

interface IContentOptionOwnerChildren extends IControlChildren {
    contentOptionUser: ContentOptionUser;
}

export default class ContentOptionOwner extends Control {
    _template: TemplateFunction = template;
    protected _children: IContentOptionOwnerChildren;
    protected contentOptionControl: typeof ContentOptionControl;
    _afterMount(): void {
        this.contentOptionControl = ContentOptionControl;
    }
    getContentOptionUser(): ContentOptionUser {
        return this._children.contentOptionUser;
    }
}
