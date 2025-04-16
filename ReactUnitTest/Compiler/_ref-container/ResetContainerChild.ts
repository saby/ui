import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Compiler/_ref-container/ResetContainerChild';

export default class ResetContainerMain extends Control {
    _template: TemplateFunction = template;
}
