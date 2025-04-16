import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/NativeRootWithArgs';

export default class NativeRootWithArgs extends Control {
    _template: TemplateFunction = template;
    _state: string = 'init';

    _beforeMount(): void {
        this._state = 'before mount';
    }

    _afterMount(): void {
        const event = new MouseEvent('mouseover', {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        // эмулируем нативную загрузку, в данной точки система событий еще не будет работать, т.к. _mounted === false;
        this._container.dispatchEvent(event);
    }
    _mouseEnterHandler(e, item): void {
        this._state = 'entered ' + item;
    }
}
