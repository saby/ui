import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ParentWithSyncAndAsyncChilds';

export default class ParentWithSyncAndAsyncChilds extends Control {
    _template: TemplateFunction = template;
}
