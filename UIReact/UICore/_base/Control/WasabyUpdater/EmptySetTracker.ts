import { Set } from 'Types/shim';
type TFunction = () => void;

/**
 */
export default class EmptySetTracker {
    private readonly set: Set<unknown> = new Set();
    constructor(private readonly emptySetHandler: TFunction) {}

    add(value: unknown): void {
        this.set.add(value);
    }

    delete(value: unknown): void {
        this.set.delete(value);
        if (!this.set.size) {
            this.emptySetHandler();
        }
    }

    get size(): number {
        return this.set.size;
    }
}
