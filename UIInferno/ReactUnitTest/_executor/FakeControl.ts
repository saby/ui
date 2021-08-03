import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/FakeControl');

class FakeControl extends Control {
    protected _template: TemplateFunction = template;
}

export = FakeControl;
