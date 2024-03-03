/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { CreateChildrenRef } from 'UICore/Executor';
import Control from '../Control';

/**
 * Класс, который управляет созданием ref'ов детей, для выставления "правильного" ребенка контрола.
 * Т.к. через конструкцию scope="{{_options}}" в шаблоне, то могут оказаться больше одного ребенка с одинаковым именем
 * и в качестве ребенка встанет тот, чей ref вызовется позже всего.
 * @private
 */
export default class ChildrenRefsCreator {
    protected _childrenRefs: Map<string, CreateChildrenRef[]> = new Map();

    constructor(private readonly _inst: Control<unknown, unknown>) {
        this.setChildrenDisabled = this.setChildrenDisabled.bind(this);
    }

    createRef(name: string, withActivator?: boolean): CreateChildrenRef {
        let refs = this._childrenRefs.get(name);
        if (!refs) {
            refs = [];
        }
        const newRef = new CreateChildrenRef(
            this._inst,
            name,
            this.setChildrenDisabled,
            withActivator
        );
        refs.push(newRef);
        this._childrenRefs.set(name, refs);
        return newRef;
    }

    /**
     * Коллбек, который отключает ref'ы других детей контрола, у которых такой же name (из-за scope="{{options}}"")
     */
    setChildrenDisabled(name: string, value: boolean): void {
        if (!name || !this._childrenRefs.has(name)) {
            return;
        }
        for (const ref of this._childrenRefs.get(name)) {
            ref.disable(value);
        }
    }

    clear(): void {
        this._childrenRefs.clear();
    }
}
