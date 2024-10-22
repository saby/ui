import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/EventDemo/WasabyReact/WasabyControl';

class WasabyControl extends Control {
    _template: TemplateFunction = template;
    result: string = '';

    myHandler() {
        this.result = 'some user logic (notify)';
    }

    clear() {
        this.result = '';
    }
}

export default WasabyControl;
