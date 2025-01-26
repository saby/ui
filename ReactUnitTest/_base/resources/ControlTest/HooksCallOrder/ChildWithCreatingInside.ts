import { TemplateFunction } from 'UICommon/Base';
import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/HooksCallOrder/ChildWithCreatingInside';

export default class ChildWithCreatingInside extends Control {
    protected _template: TemplateFunction = template;
    protected shouldShowChild: boolean;

    showChild(): void {
        this.shouldShowChild = true;
    }
}
