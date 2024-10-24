/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias */
/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import type { ReactNode } from 'react';
import { TIState } from 'UICommon/interfaces';
import { logExecutionTimeBegin, logExecutionTimeEnd } from 'UICore/Jsx';
import { TWasabyOverReactProps } from '../interfaces';
import BaseLogic, { TWasabyContext } from './BaseLogic';
import type Control from '../Control';
import { Runner } from './Runner';

export default class ServerLogic<
    TOptions extends TWasabyOverReactProps = {},
    TState extends TIState = void
> extends BaseLogic<TOptions, TState> {
    constructor(inst: Control<TOptions, TState>, context?: TWasabyContext) {
        super(inst, context);

        this._beforeUpdateRun = new Runner(() => {
            return;
        });
    }
    protected beforeRender(wasabyOptions, checkApiRedefined: () => void) {
        if (this._beforeFirstRender) {
            this._beforeFirstRender(wasabyOptions);
        }
    }
    protected calculateAttributes(): Record<string, unknown> {
        // @ts-ignore
        return this.inst._options._$attributes || {};
    }

    render(isCompatibleControl: boolean, checkApiRedefined: () => void): ReactNode {
        const start = logExecutionTimeBegin();
        const result = super.render(isCompatibleControl, checkApiRedefined);
        logExecutionTimeEnd(this.inst, start);
        return result;
    }
    protected secureOptionsForStateReceiver(options: object): object {
        return [
            '_$events',
            'ref',
            '_physicParent',
            '_logicParent',
            '_registerAsyncChild',
            '_$blockOptionNames',
            '_$attributes',
        ].reduce(
            (result, key) => {
                delete result[key];

                return result;
            },
            { ...options }
        );
    }
}
