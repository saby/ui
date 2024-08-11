/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import { ReactiveUpdateManager, TUpdater } from './ReactiveUpdateManager';

type TArray = unknown[];
const arrayChangeUpdateMap: Map<TArray, ReactiveUpdateManager> = new Map();
const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
const originMethods: Record<string, Function> = {};
for (const methodName of arrayMethods) {
    originMethods[methodName] = Array.prototype[methodName];
}

export function observeArrayChange(array: TArray, callback: TUpdater, fieldName: string): void {
    if (!array) {
        return;
    }
    if (!arrayChangeUpdateMap.has(array)) {
        arrayChangeUpdateMap.set(array, new ReactiveUpdateManager());
    }

    const reactiveUpdateCaller = arrayChangeUpdateMap.get(array);
    if (reactiveUpdateCaller.setUpdater(callback)) {
        let arrayVersion = 0;
        Object.defineProperties(array, {
            _arrayVersion: {
                value: arrayVersion,
                enumerable: false,
                writable: true,
                configurable: true,
            },
            getArrayVersion: {
                value: () => {
                    return arrayVersion;
                },
                enumerable: false,
                writable: false,
                configurable: true,
            },
        });

        for (const methodName of arrayMethods) {
            const method = originMethods[methodName];
            const mutator = function mutator(): unknown[] {
                const res = method.apply(this, arguments);
                arrayVersion++;
                reactiveUpdateCaller.callHandler(fieldName + ` .${methodName}`);
                return res;
            };
            Object.defineProperty(array, methodName, {
                value: mutator,
                enumerable: false,
                writable: true,
                configurable: true,
            });
        }
    }
}

export function unobserveAllArrayChanges(callback: TUpdater): void {
    for (const [array, reactiveUpdateCaller] of Array.from(arrayChangeUpdateMap.entries())) {
        if (reactiveUpdateCaller.isCurrentUpdater(callback)) {
            unobserveArrayChange(array, callback);
        }
    }
}

export function unobserveArrayChange(array: TArray, callback: TUpdater): void {
    if (!array || !arrayChangeUpdateMap.has(array)) {
        return;
    }

    const reactiveUpdateCaller = arrayChangeUpdateMap.get(array);
    if (reactiveUpdateCaller.unsetUpdater(callback)) {
        for (const methodName of arrayMethods) {
            const method = originMethods[methodName];
            Object.defineProperty(array, methodName, {
                value: method,
                enumerable: false,
                writable: true,
                configurable: true,
            });
        }
        arrayChangeUpdateMap.delete(array);
    }
}
