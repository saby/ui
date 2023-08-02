import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdateReactiveDuringAsyncMount/ControlChildSync';

export default class ControlChildSync extends Control {
    _template: TemplateFunction = template;
}
