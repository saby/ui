import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/SpecialEvent';

export default class SpecialEvent extends Control {
    _template: TemplateFunction = template;
    protected clickCount: number = 0;

    _specialHandler(): void {
        this.clickCount += 1;
        const specialClick: Event & {
            __$blockNextEvent?: { [key: string]: Function };
        } = new Event('click');
        specialClick.__$blockNextEvent = {
            click: (_event: Event) => {
                _event.preventDefault();
                _event.stopPropagation();
            },
        };
        this._container.dispatchEvent(specialClick);
    }
}
