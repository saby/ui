import Control from '../../Control';

type TFunction = () => void;

type THookName = 'sync' | 'async';

type TControl = Control<unknown, unknown>;

import { ControlTreeEdge } from './ControlTreeEdge';
import { WasabyHooksQueue } from './WasabyHooksQueue';

/**
 * @private
 */

export default class HooksCaller {
    private syncHooks: WasabyHooksQueue = new WasabyHooksQueue();
    private asyncHooks: WasabyHooksQueue = new WasabyHooksQueue();
    private aliveTreeMap: WeakMap<TControl, ControlTreeEdge> = new WeakMap();

    registerControl(
        control: TControl,
        parent?: TControl,
        unmountHook?: TFunction
    ): void {
        const parentEdge = parent && this.aliveTreeMap.get(parent);
        const controlEdge = new ControlTreeEdge(control, parentEdge, () => {
            if (unmountHook) {
                unmountHook();
            }
            this.aliveTreeMap.delete(control);

            this.syncHooks.dequeue(control);
            this.asyncHooks.dequeue(control);
        });
        this.aliveTreeMap.set(control, controlEdge);
    }

    unregisterControl(control: TControl): void {
        if (this.aliveTreeMap.has(control)) {
            this.aliveTreeMap.get(control).destroyTree();
        }
    }

    addHook(owner: TControl, name: THookName, hook: TFunction): void {
        if (hook) {
            this[`${name}Hooks`].enqueue(owner, hook);
        }
    }

    runHooks(name: THookName): void {
        this[`${name}Hooks`].release();
    }
}
