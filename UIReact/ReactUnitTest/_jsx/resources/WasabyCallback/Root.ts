import { Control, TemplateFunction } from 'UI/Base';
/* eslint-disable no-console */
// @ts-ignore
import * as template from 'wml!ReactUnitTest/_jsx/resources/WasabyCallback/Root';

export default class Root extends Control {
    protected _template: TemplateFunction = template;
    protected result: string = 'init';

    resultHandlerEvent(e, val, val1) {
        this.result = `${e.type} ${val} ${val1}`;
    }

    resultHandlerNoEvent(val, val1) {
        this.result = `${val} ${val1}`;
    }

    resultHandlerWithVal(_, val, val1) {
        this.result = `${val} ${val1}`;
    }
}
