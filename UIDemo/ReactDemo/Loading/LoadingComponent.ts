import { Control } from 'UICore/Base';

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class LoadingComponent extends Control {
    constructor(props: any, ctx: any) {
        super(props, ctx);
        // @ts-ignore
        this.state = { loading: true };
        // @ts-ignore
        this._$asyncInProgress = true;
    }
}
