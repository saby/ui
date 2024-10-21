/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import { useRef, useState, useEffect } from 'react';
import { ReactiveUpdateManager, TUpdater } from './ReactiveUpdateManager';
interface IVersional {
    getVersion: () => number;
}

const isServerSide = typeof window === 'undefined';
const versionChangeUpdateMap: Map<IVersional, ReactiveUpdateManager> = new Map();

export function useObservableOfVersion(versionObject: IVersional): void {
    const versionObjectRef = useRef<IVersional | undefined>();
    const setVersion = useState(0)[1];
    const incVersionRef = useRef<() => void>(() => {
        return setVersion((prevVersion) => {
            return prevVersion + 1;
        });
    });
    useEffect(() => {
        return () => {
            return unobserveVersionChange(versionObjectRef.current, incVersionRef.current);
        };
    }, []);

    if (versionObjectRef.current !== versionObject) {
        unobserveVersionChange(versionObjectRef.current, incVersionRef.current);
        observeVersionChange(versionObject, incVersionRef.current);
        versionObjectRef.current = versionObject;
    }
}

export function observeVersionChange(
    versionObject: IVersional,
    callback: TUpdater,
    componentNameFromArgs?: string,
    ...callbackArgs: unknown[]
): void {
    if (isServerSide) {
        return;
    }
    if (!versionObject) {
        return;
    }

    let reactiveUpdateCaller = versionChangeUpdateMap.get(versionObject);
    if (!reactiveUpdateCaller) {
        reactiveUpdateCaller = new ReactiveUpdateManager();
        versionChangeUpdateMap.set(versionObject, reactiveUpdateCaller);
    }
    const componentName = componentNameFromArgs || calculateComponentName();
    if (reactiveUpdateCaller.setUpdater(callback, componentName)) {
        let currentValue = versionObject._version;
        Object.defineProperty(versionObject, '_version', {
            enumerable: true,
            configurable: true,
            set(val: number): void {
                if (currentValue !== val) {
                    currentValue = val;
                    reactiveUpdateCaller.callHandler(...callbackArgs);
                }
            },
            get(): number | undefined {
                return currentValue;
            },
        });
    }
}

export function unobserveAllVersionChanges(callback: TUpdater): void {
    if (isServerSide) {
        return;
    }
    for (const [versionObject, reactiveUpdateCaller] of Array.from(
        versionChangeUpdateMap.entries()
    )) {
        if (reactiveUpdateCaller.isCurrentUpdater(callback)) {
            unobserveVersionChange(versionObject, callback);
        }
    }
}

export function unobserveVersionChange(
    versionObject: IVersional | undefined,
    callback: TUpdater
): void {
    if (isServerSide) {
        return;
    }

    const reactiveUpdateCaller = !!versionObject && versionChangeUpdateMap.get(versionObject);
    if (!reactiveUpdateCaller) {
        return;
    }
    if (reactiveUpdateCaller.unsetUpdater(callback)) {
        const currentValue = versionObject._version;
        Object.defineProperty(versionObject, '_version', {
            enumerable: true,
            configurable: true,
            writable: true,
            value: currentValue,
        });
        versionChangeUpdateMap.delete(versionObject);
    }
}

/**
 * Вычислим строчку кода, которая вызывала observeVersionChange или useObservableOfVersion
 * @private
 */
function calculateComponentName(): string {
    const callStack = new Error('').stack?.split('\n');
    if (!callStack) {
        return '';
    }
    for (let i = 2; i < callStack.length; i++) {
        const stackLine = callStack[i];
        if (!stackLine.includes('/UICore/')) {
            return stackLine;
        }
    }
    return '';
}
