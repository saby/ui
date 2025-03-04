/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { CreateChildrenRef } from 'UICore/Executor';
import type { TAnyControl } from '../interfaces';

/**
 * Класс, который управляет созданием ref'ов детей, для выставления "правильного" ребенка контрола.
 * Т.к. через конструкцию scope="{{_options}}" в шаблоне, то могут оказаться больше одного ребенка с одинаковым именем
 * и в качестве ребенка встанет тот, чей ref вызовется позже всего.
 * @private
 */
export default class ChildrenRefsCreator {
    protected _childrenRefs: Map<string, CreateChildrenRef[]> = new Map();

    constructor(private readonly _inst: TAnyControl) {
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
    getRef(name: string): CreateChildrenRef | undefined {
        return this._childrenRefs.get(name)?.[0];
    }

    /**
     * Коллбек, который отключает ref'ы других детей контрола, у которых такой же name (из-за scope="{{options}}"")
     */
    setChildrenDisabled(name: string, value: boolean): void {
        const childrenRefs = name && this._childrenRefs.get(name);
        if (!childrenRefs) {
            return;
        }
        for (const ref of childrenRefs) {
            ref.disable(value);
        }
    }

    clear(): void {
        // clear зовется в начале рендера. сами рефы оставляем, они должны быть актуальны.
        // тут сбрасываем флаги disabled так как строим с начала
        this._childrenRefs.forEach((_value, name: string) => {
            this.setChildrenDisabled(name, false);
        });
    }
}
