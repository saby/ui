import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';

import template = require('wml!ReactUnitTest/Focus/Root');

class TestControl extends Control {
    _template: TemplateFunction = template;
}

export default TestControl;
