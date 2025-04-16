import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!UIDemo/AsyncControls/ColumnAsync/Delay/Promise/DescendManual');

interface IOptions extends IControlOptions {
    delay: number;
}

export default class DescendManual extends Control<IOptions, {}> {
    protected _template: TemplateFunction = template;
    protected _isOpen: boolean = false;

    protected _beforeMount(options: IOptions): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, options.delay);
        });
    }

    protected _setOpen(): void {
        this._isOpen = !this._isOpen;
        this._forceUpdate();
    }

    static _styles: string[] = ['UIDemo/AsyncControls/AsyncTestDemo'];
}
