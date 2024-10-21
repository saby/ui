import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventSubscriberDemo/Root';

export default class Root extends Control {
    _template: TemplateFunction = template;
}
