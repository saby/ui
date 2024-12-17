// @ts-ignore
import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/Synchronizer/Demo1/Main');

class Main extends Control {
    _template: TemplateFunction = template;
    _value = 0;
    _click() {
        this._value++;
    }
}

export default Main;
