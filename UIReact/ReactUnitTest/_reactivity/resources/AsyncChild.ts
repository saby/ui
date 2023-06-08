import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/AsyncChild';

export default class SimpleChild extends Control {
    _template: TemplateFunction = template;
    _beforeMount(): void {
        /**/
    }
    _afterMount(): void {
        /**/
    }
}
