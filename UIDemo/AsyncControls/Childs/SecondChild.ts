import { Control, TemplateFunction } from 'UI/Base';
import { IoC } from 'Env/Env';
import template = require('wml!UIDemo/AsyncControls/Childs/SecondChild');

export default class SecondChild extends Control {
    protected _template: TemplateFunction = template;
    protected _multipleControls: number = 5;
    protected _multipleChildControls: number = 2;
    protected _beforeMount(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                IoC.resolve('ILogger').info('Second resolve');
                resolve();
            }, 2000);
        });
    }
}
