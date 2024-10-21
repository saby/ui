import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdateReactiveDuringAsyncMount/ControlParent';

export default class ControlParent extends Control {
    _template: TemplateFunction = template;
    protected _value: string;
}
