import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ParentWithConditionChild';

export default class ParentWithConditionChild extends Control {
    _template: TemplateFunction = template;

    protected shouldShowChild: boolean = false;
    protected ownState: string = 'one';

    showChild(): void {
        this.shouldShowChild = true;
    }
    updateOwnState(): void {
        this.ownState = 'two';
    }
}
