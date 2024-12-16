import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/ClearAfterUnmount/ParentLinkRoot';

export default class ParentLinkRoot extends Control {
    _template: TemplateFunction = template;
    showInvisible: boolean = true;

    showHandler(): void {
        this.showInvisible = false;
    }
}
