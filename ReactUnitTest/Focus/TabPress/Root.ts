import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Focus/TabPress/Root';

export default class TabPressRoot extends Control {
    _template: TemplateFunction = template;
}
