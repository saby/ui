import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/WmlReactChildren/WasabyWithReactChild';
import ReactChild from './ReactChild';

export default class WasabyWithReactChild extends Control {
    _template: TemplateFunction = template;
    protected _children: {
        reactComponent: ReactChild;
    };
    getReactChild(): ReactChild {
        return this._children.reactComponent;
    }
}
