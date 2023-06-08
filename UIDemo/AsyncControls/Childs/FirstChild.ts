import { Control, TemplateFunction } from 'UI/Base';
import { IoC } from 'Env/Env';
import template = require('wml!UIDemo/AsyncControls/Childs/FirstChild');

export default class FirstChild extends Control {
    protected _template: TemplateFunction = template;
    protected _multipleControls: number = 5;
    protected _beforeMount(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                IoC.resolve('ILogger').info('First resolve');
                resolve();
            }, 3000);
        });
    }
}
