import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventSubscriberDemo/ManyScope/ControlB/WasabyHOC';

export default class WasabyHOC extends Control {
    _template: TemplateFunction = template;
}
