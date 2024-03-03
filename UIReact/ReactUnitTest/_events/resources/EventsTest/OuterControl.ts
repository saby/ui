import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/OuterControl';

export default class OuterControl extends Control<
    IControlOptions & { clickHandler: Function }
> {
    _template: TemplateFunction = template;
    _clickHandler(): void {
        this._options.clickHandler();
    }
}
