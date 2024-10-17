/**
 * @author Krylov M.A.
 */

/**
 * Interface of container element.
 *
 * @private
 */
export interface IElement<TKey, TValue> {
    key: TKey;
    value: TValue;
}

export default class Container<TKey, TValue> {
    private readonly keyIndices: Map<TKey, IElement<TKey, TValue>>;
    private readonly valueIndices: Map<TValue, IElement<TKey, TValue>>;

    constructor() {
        this.keyIndices = new Map<TKey, IElement<TKey, TValue>>();
        this.valueIndices = new Map<TValue, IElement<TKey, TValue>>();
    }

    get size(): number {
        return this.keyIndices.size;
    }

    add(element: IElement<TKey, TValue>): void {
        this.keyIndices.set(element.key, element);
        this.valueIndices.set(element.value, element);
    }

    hasKey(key: TKey): boolean {
        return this.keyIndices.has(key);
    }

    getByKey(key: TKey): IElement<TKey, TValue> | undefined {
        return this.keyIndices.get(key);
    }

    deleteByKey(key: TKey): boolean {
        if (this.keyIndices.has(key)) {
            this.valueIndices.delete((this.keyIndices.get(key) as IElement<TKey, TValue>).value);
        }

        return this.keyIndices.delete(key);
    }

    hasValue(value: TValue): boolean {
        return this.valueIndices.has(value);
    }

    getByValue(value: TValue): IElement<TKey, TValue> | undefined {
        return this.valueIndices.get(value);
    }

    deleteByValue(value: TValue): boolean {
        if (this.valueIndices.has(value)) {
            this.keyIndices.delete((this.valueIndices.get(value) as IElement<TKey, TValue>).key);
        }

        return this.valueIndices.delete(value);
    }

    keys(): TKey[] {
        return [...this.keyIndices.keys()];
    }

    values(): TValue[] {
        return [...this.valueIndices.keys()];
    }

    elements(): IElement<TKey, TValue>[] {
        return [...this.keyIndices.values()];
    }
}
