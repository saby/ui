import { TemplateFunction } from 'UICommon/Base';
import { Control, IControlChildren } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/HooksCallOrder/HooksCallOrderRoot';
import ChildWithCreatingInside from './ChildWithCreatingInside';
import ChildWithUpdatingInside from './ChildWithUpdatingInside';

interface IHooksCallOrderRootChildren extends IControlChildren {
    childWithCreatingInside: ChildWithCreatingInside;
    childWithUpdatingInside: ChildWithUpdatingInside;
}

export default class HooksCallOrderRoot extends Control {
    protected _template: TemplateFunction = template;
    _children: IHooksCallOrderRootChildren;
}
