import { Control, TemplateFunction } from 'UI/Base';
import { IoC } from 'Env/Env';
import template = require('wml!UIDemo/AsyncControls/Childs/ThirdChild');

export default class ThirdChild extends Control {
    protected _template: TemplateFunction = template;
    protected _multipleControls: number = 2;

    protected _beforeMount(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                IoC.resolve('ILogger').info('Third resolve');
                resolve();
            }, 700);
        });
    }
}
