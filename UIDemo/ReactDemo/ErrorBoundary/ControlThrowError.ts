import { Control } from 'UICore/Base';
import * as template from 'wml!UIDemo/ReactDemo/ErrorBoundary/ControlThrowError';
import type { TemplateFunction } from 'UICommon/Base';

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ControlThrowError extends Control {
    errorMessage: string = 'I Crashed';
    labelButton: string = 'To Throw Error';
    constructor(props: any, ctx: any) {
        super(props, ctx);
        // @ts-ignore
        this.state = { ...this.state, shouldThrowError: false };
        this.throwError = this.throwError.bind(this);
    }
    protected _template: TemplateFunction = template;

    throwError(): void {
        this.setState((state) => {
            return {
                ...state,
                shouldThrowError: true,
            };
        });
        this._forceUpdate();
    }
    render(): any {
        // @ts-ignore
        if (this.state.shouldThrowError) {
            throw new Error(this.errorMessage);
        }
        return super.render();
    }
}
