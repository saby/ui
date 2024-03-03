import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/NativeRoot';

export default class NativeRoot extends Control {
    _template: TemplateFunction = template;
    _state: string = 'init';

    _beforeMount(): void {
        this._state = 'before mount';
    }

    _afterMount(): void {
        // эмулируем нативную загрузку, в данной точки система событий еще не будет работать, т.к. _mounted === false;
        this._container.dispatchEvent(new Event('load'));
    }
    _loadHandler(): void {
        this._state = 'load complete';
    }
}
