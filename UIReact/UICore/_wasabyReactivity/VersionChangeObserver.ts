import { useRef, useState, useEffect } from 'react';
import { ReactiveUpdateManager, TUpdater } from './ReactiveUpdateManager';
interface IVersional {
    getVersion: () => number;
}

const versionChangeUpdateMap: Map<IVersional, ReactiveUpdateManager> =
    new Map();

export function useObservableOfVersion(versionObject: IVersional): void {
    const versionObjectRef = useRef<IVersional>(undefined);
    const setVersion = useState(0)[1];
    const incVersionRef = useRef<() => void>(undefined);
    if (!incVersionRef.current) {
        incVersionRef.current = () => {
            return setVersion((prevVersion) => {
                return prevVersion + 1;
            });
        };
    }
    useEffect(() => {
        return () => {
            return unobserveVersionChange(
                versionObjectRef.current,
                incVersionRef.current
            );
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
    ...callbackArgs: unknown[]
): void {
    if (!versionObject) {
        return;
    }
    if (!versionChangeUpdateMap.has(versionObject)) {
        versionChangeUpdateMap.set(versionObject, new ReactiveUpdateManager());
    }

    const reactiveUpdateCaller = versionChangeUpdateMap.get(versionObject);
    if (reactiveUpdateCaller.setUpdater(callback)) {
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
            get(): number {
                return currentValue;
            },
        });
    }
}

export function unobserveAllVersionChanges(callback: TUpdater): void {
    for (const [versionObject, reactiveUpdateCaller] of Array.from(
        versionChangeUpdateMap.entries()
    )) {
        if (reactiveUpdateCaller.isCurrentUpdater(callback)) {
            unobserveVersionChange(versionObject, callback);
        }
    }
}

export function unobserveVersionChange(
    versionObject: IVersional,
    callback: TUpdater
): void {
    if (!versionObject || !versionChangeUpdateMap.has(versionObject)) {
        return;
    }

    const reactiveUpdateCaller = versionChangeUpdateMap.get(versionObject);
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
