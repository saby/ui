import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Focus/RestoreFocus/Root2';

// Синхронная загрузка, чтобы замокать асинхронный load.
import 'ReactUnitTest/Focus/RestoreFocus/WsControl';

export default class Root2 extends Control {
    _template: TemplateFunction = template;
    protected showFirstInput: boolean = true;
    hideFirstInput(): void {
        this.showFirstInput = false;
    }
}
