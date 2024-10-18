import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/ContentOptions/resources/Parent');

interface IOptions extends IControlOptions {
    child: {};
    childOptions: { controlOptions: {}; wmlOption: string };
}

export default class InternalControl extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected _status: string;

    protected _beforeUpdate(options: IOptions): void {
        if (
            this._options.child === options.child &&
            this._options.childOptions === options.childOptions &&
            this._options.childOptions.controlOptions &&
            this._options.childOptions.controlOptions ===
                options.childOptions.controlOptions &&
            this._options.childOptions.wmlOption &&
            this._options.childOptions.wmlOption ===
                options.childOptions.wmlOption
        ) {
            this._status = 'ДА';
        } else {
            this._status = 'НЕТ';
        }
    }
}
