import { TemplateFunction } from 'UICommon/Base';
import { TestBaseControl, ITestOptions } from '../Base';

import template = require('wml!ReactUnitTest/Focus/Input');

interface ITestControlOptions extends ITestOptions {
    inputId?: string;
}
export default class TestControl extends TestBaseControl<ITestControlOptions> {
    _template: TemplateFunction = template;
}
