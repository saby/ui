import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Compiler/_ref-container/ResetContainerMain';

export default class ResetContainerMain extends Control {
    _template: TemplateFunction = template;
    private showChildControl: boolean = false;

    toggleChildControl(): void {
        this.showChildControl = !this.showChildControl;
    }
    getContainer(): HTMLElement {
        return this._container;
    }
}
