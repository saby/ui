import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ErrorBoundaryTest/CrashedControl';
import { TemplateFunction } from 'UICommon/_base/Control';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class CrashedControl extends Control {
    errorMessage: string = 'I Crashed';
    _template: TemplateFunction = template;

    constructor(props: any, ctx: any) {
        super(props, ctx);
    }

    render(): any {
        throw new Error(this.errorMessage);
    }
}
