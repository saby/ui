import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/Focus/Activate/InHooksActivateCaller');

interface IInHooksActivateCallerOptions extends IControlOptions {
    shouldActivateBeforeMount?: boolean;
    shouldActivateAfterMount?: boolean;
}

export default class InHooksActivateCaller extends Control<IInHooksActivateCallerOptions> {
    protected _template: TemplateFunction = template;
    protected _beforeMount(options?: IInHooksActivateCallerOptions): void {
        if (options.shouldActivateBeforeMount) {
            this.activate();
        }
    }
    protected _afterMount(options?: IInHooksActivateCallerOptions): void {
        if (options.shouldActivateAfterMount) {
            this.activate();
        }
    }
}
