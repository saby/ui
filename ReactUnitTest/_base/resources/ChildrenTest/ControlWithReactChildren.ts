import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/ControlWithReactChildren';
import ChildReactComponent from './ChildReactComponent';

export default class ControlWithReactChildren extends Control {
    _template: TemplateFunction = template;
    protected _children: {
        reactComponent: ChildReactComponent;
    };
    getChildReactComponent(): ChildReactComponent {
        return this._children.reactComponent;
    }
}
