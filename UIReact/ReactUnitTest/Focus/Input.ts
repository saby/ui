import { TemplateFunction } from 'UICommon/Base';
import { TestBaseControl } from '../Base';

import template = require('wml!ReactUnitTest/Focus/Input');

export default class TestControl extends TestBaseControl {
    _template: TemplateFunction = template;
}
