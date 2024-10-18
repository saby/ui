/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import { logger } from 'Application/Env';

export type TUpdater = (...args: unknown[]) => void;

const pauseReactiveMap = new Map();
export function pauseReactive(pauseReactiveMapKey: unknown, action: Function): void {
    if (!pauseReactiveMap.has(pauseReactiveMapKey)) {
        pauseReactiveMap.set(pauseReactiveMapKey, 0);
    }
    pauseReactiveMap.set(pauseReactiveMapKey, pauseReactiveMap.get(pauseReactiveMapKey) + 1);
    try {
        action();
    } finally {
        pauseReactiveMap.set(pauseReactiveMapKey, pauseReactiveMap.get(pauseReactiveMapKey) - 1);
        if (pauseReactiveMap.get(pauseReactiveMapKey) === 0) {
            pauseReactiveMap.delete(pauseReactiveMapKey);
        }
    }
}

let shouldShowError: boolean = true;
export function pauseErrorWrongUpdater(action: () => void): void {
    shouldShowError = false;
    try {
        action();
    } finally {
        shouldShowError = true;
    }
}

export class ReactiveUpdateManager {
    private componentName?: string;
    private updater?: TUpdater;
    setUpdater(newUpdater: TUpdater, componentName: string): boolean {
        if (this.updater) {
            if (shouldShowError) {
                const message =
                    `Компонент ${this.componentName} уже будет перерисовываться при изменении этого объекта. ` +
                    'Чтобы избежать каскада обновлений, дальнейшие подписки игнорируются. ' +
                    'При необходимости перерисовка может распространиться вниз через пропсы или контекст.';
                logger.error(message, this.updater);
            }
            return false;
        }
        this.componentName = componentName || '[unknown name]';
        this.updater = newUpdater;
        return true;
    }
    isCurrentUpdater(updater: TUpdater): boolean {
        return !!this.updater && this.updater === updater;
    }
    unsetUpdater(updater: TUpdater): boolean {
        if (!this.isCurrentUpdater(updater)) {
            return false;
        }
        this.updater = undefined;
        this.componentName = undefined;
        return true;
    }
    callHandler(...args: unknown[]): void {
        if (this.updater && !pauseReactiveMap.has(this.updater)) {
            this.updater(...args);
        }
    }
}
