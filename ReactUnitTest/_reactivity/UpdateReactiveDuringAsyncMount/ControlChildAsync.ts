import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdateReactiveDuringAsyncMount/ControlChildAsync';

export default class ControlChildAsync extends Control {
    _template: TemplateFunction = template;
}
