import { Control, IControlChildren } from 'UI/Base';
import ControlWithNamedPartial from './ControlWithNamedPartial';

interface IParentNamedPartialContentChildren extends IControlChildren {
    controlWithNamedPartial: ControlWithNamedPartial;
}

export default class ParentNamedPartialContent extends Control {
    protected _children: IParentNamedPartialContentChildren;
    getControlWithNamedPartial(): ControlWithNamedPartial {
        if ('controlWithNamedPartial' in this._children) {
            return this._children.controlWithNamedPartial;
        }
    }
}
