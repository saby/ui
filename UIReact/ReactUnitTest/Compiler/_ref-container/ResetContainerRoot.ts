import { Control, IControlChildren } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Compiler/_ref-container/ResetContainerRoot';
import ResetContainerMain from './ResetContainerMain';

interface IResetContainerRootChildren extends IControlChildren {
    mainChild: ResetContainerMain;
}

export default class ResetContainerRoot extends Control {
    _template: TemplateFunction = template;
    _children: IResetContainerRootChildren;

    getChildContainer(): HTMLElement {
        return this._children.mainChild.getContainer();
    }
    toggleGrandchildControl(): void {
        this._children.mainChild.toggleChildControl();
    }
}
