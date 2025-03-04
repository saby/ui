/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import type { TAnyControl } from '../../interfaces';

type TFunction = () => void;

type THookName = 'sync' | 'async';

import { ControlTreeEdge } from './ControlTreeEdge';
import { WasabyHooksQueue } from './WasabyHooksQueue';

/**
 * @private
 */

export default class HooksCaller {
    private syncHooks: WasabyHooksQueue = new WasabyHooksQueue();
    private asyncHooks: WasabyHooksQueue = new WasabyHooksQueue();
    private aliveTreeMap: WeakMap<TAnyControl, ControlTreeEdge> = new WeakMap();

    registerControl(control: TAnyControl, parent?: TAnyControl, unmountHook?: TFunction): void {
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

    // Какой-то дочерний контрол упал с ошибкой в конструкторе.
    // Родительский контрол ошибку поймал, нарисовал заглушку.
    // Соседи дочернего контрола позвали рендер, но рендер оборвался. Никаких хуков больше не позвалось.
    // Нужно удалить этих соседей из дерева, чтобы не зависало васаби обновление.
    registerErrorRenderControl(control: TAnyControl): void {
        this.aliveTreeMap.get(control)?.destroyTree(true);
    }

    unregisterControl(control: TAnyControl): void {
        const controlTreeEdge = this.aliveTreeMap.get(control);
        controlTreeEdge?.destroyTree();
    }

    addHook(owner: TAnyControl, name: THookName, hook?: TFunction): void {
        if (hook) {
            this[`${name}Hooks`].enqueue(owner, hook);
        }
    }

    runHooks(name: THookName): void {
        this[`${name}Hooks`].release();
    }
}
