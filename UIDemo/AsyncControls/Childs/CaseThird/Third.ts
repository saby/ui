import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/Childs/CaseThird/Third');

interface IOptions extends IControlOptions {
    delay: number;
}

export default class Third extends Control<IOptions, {}> {
    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IOptions): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, options.delay);
        });
    }
}
