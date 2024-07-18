/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { getStore, setStore } from 'Application/Env';
import { RecordSet } from 'Types/collection';

const DATA_STORAGE_KEY = 'ScrollOnBodyStorage';

// Хранилище содержит поле enabled - включен механизм прокрутки на body или нет
class Store<T> {
    private readonly _store: Record<string, T> = {};
    get(key: string): T {
        return this._store[key];
    }
    set(key: string, value: T): boolean {
        this._store[key] = value;
        return true;
    }
    remove(key: string): void {
        delete this._store[key];
    }
    getKeys(): string[] {
        return Object.keys(this._store);
    }

    toObject(): Record<string, T> {
        return { ...this._store };
    }
}

export default {
    init(): void {
        if (!(getStore(DATA_STORAGE_KEY) instanceof Store)) {
            setStore(DATA_STORAGE_KEY, new Store());
        }
    },
    read(key: string): RecordSet {
        this.init();
        return (getStore(DATA_STORAGE_KEY) as Store<RecordSet>).get(key);
    },
    write(key: string, value: boolean): void {
        this.init();
        (getStore(DATA_STORAGE_KEY) as Store<boolean>).set(key, value);
    },
    delete(key: string): void {
        getStore(DATA_STORAGE_KEY).remove(key);
    },
};
