import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventSubscriberDemo/WasabyControl';

export default class WasabyControl extends Control {
    _template: TemplateFunction = template;
}
