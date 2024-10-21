import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/Childs/Simple/ThirdNested');

interface IOptions extends IControlOptions {
    delay: number;
}

export default class ThirdNested extends Control<IOptions, {}> {
    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IOptions): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, options.delay);
        });
    }
}
