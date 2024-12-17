import { Control, IControlChildren, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NamedPartialChildren/ControlWithNamedPartial';

interface IControlWithNamedPartialChildren extends IControlChildren {
    contentChild: HTMLElement | Control;
}

export default class ControlWithNamedPartial extends Control {
    protected _template: TemplateFunction = template;
    protected _children: IControlWithNamedPartialChildren;
    getContentChild(): IControlWithNamedPartialChildren['contentChild'] {
        if ('contentChild' in this._children) {
            return this._children.contentChild;
        }
    }
}
