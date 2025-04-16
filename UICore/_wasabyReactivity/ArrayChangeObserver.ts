/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import { ReactiveUpdateManager, TUpdater } from './ReactiveUpdateManager';

type TArray = unknown[];
const arrayChangeUpdateMap: Map<TArray, ReactiveUpdateManager> = new Map();
const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'] as const;
const originMethods: Record<string, Function> = {};
for (const methodName of arrayMethods) {
    originMethods[methodName] = Array.prototype[methodName];
}

export function observeArrayChange(
    array: TArray,
    callback: TUpdater,
    componentName: string,
    fieldName: string
): void {
    if (!array) {
        return;
    }

    const reactiveUpdateCaller = getReactiveUpdateCaller(array);
    if (reactiveUpdateCaller.setUpdater(callback, componentName)) {
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
            const mutator = function mutator(this: unknown[]): unknown[] {
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

function getReactiveUpdateCaller(array: TArray): ReactiveUpdateManager {
    const reactiveUpdateCallerFromMap = arrayChangeUpdateMap.get(array);
    if (reactiveUpdateCallerFromMap) {
        return reactiveUpdateCallerFromMap;
    }
    const reactiveUpdateCallerNew = new ReactiveUpdateManager();
    arrayChangeUpdateMap.set(array, reactiveUpdateCallerNew);
    return reactiveUpdateCallerNew;
}

export function unobserveAllArrayChanges(callback: TUpdater): void {
    for (const [array, reactiveUpdateCaller] of Array.from(arrayChangeUpdateMap.entries())) {
        if (reactiveUpdateCaller.isCurrentUpdater(callback)) {
            unobserveArrayChange(array, callback);
        }
    }
}

export function unobserveArrayChange(array: TArray, callback: TUpdater): void {
    const reactiveUpdateCaller = !!array && arrayChangeUpdateMap.get(array);

    if (!reactiveUpdateCaller) {
        return;
    }

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
