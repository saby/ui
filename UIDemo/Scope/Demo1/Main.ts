// @ts-ignore
import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/Scope/Demo1/Main');

class Main extends Control {
    _template: TemplateFunction = template;
    _getResults() {
        return this._calcSomething() + ' руб';
    }
    _calcSomething() {
        return 1 + 1;
    }
}

export default Main;
