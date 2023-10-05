import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/Compiler/_ref-container/CallRefsAfterUp';

export default class CallRefsAfterUp extends Control {
    _template: TemplateFunction = template;

    _beforeMount() {
        return new Promise<void>((resolve) => {
            resolve(undefined);
        });
    }

    getContainer() {
        return this._container;
    }
}
