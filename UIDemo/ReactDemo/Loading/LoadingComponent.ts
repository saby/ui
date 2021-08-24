import {Control} from 'UICore/Base';

// tslint:disable:ban-ts-ignore
// tslint:disable:no-any
export default class LoadingComponent extends Control {
    constructor(props: any, ctx: any) {
        super(props, ctx);
        // @ts-ignore
        this.state = { loading: true };
        // @ts-ignore
        this._$asyncInProgress = true;
    }
}
