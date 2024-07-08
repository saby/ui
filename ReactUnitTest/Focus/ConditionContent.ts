import { TemplateFunction } from 'UICommon/Base';
import { TestBaseControl } from '../Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/Focus/ConditionContent');

class TestControl extends TestBaseControl {
    _template: TemplateFunction = template;
    noNeedContent: boolean = false;
}

export default TestControl;
