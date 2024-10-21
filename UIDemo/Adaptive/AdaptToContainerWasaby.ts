import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/Adaptive/AdaptToContainerWasaby');

import 'css!Tailwind/tailwind';

class AdaptToContainerWasaby extends Control {
    protected _template: TemplateFunction = template;
}

export = AdaptToContainerWasaby;
