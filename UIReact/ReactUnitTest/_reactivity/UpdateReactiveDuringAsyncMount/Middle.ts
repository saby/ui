import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdateReactiveDuringAsyncMount/Middle';

export default class Middle extends Control {
    _template: TemplateFunction = template;
}
