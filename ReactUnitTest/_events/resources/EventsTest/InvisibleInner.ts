import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/InvisibleInner';

export default class InvisibleInner extends Control {
    _template: TemplateFunction = template;
}
