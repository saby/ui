/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import { Set } from 'Types/shim';
type TFunction = () => void;

/**
 * @private
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
