import { logger } from 'Application/Env';

export type TUpdater = (...args: unknown[]) => void;

const pauseReactiveMap = new Map();
export function pauseReactive(
    pauseReactiveMapKey: unknown,
    action: Function
): void {
    if (!pauseReactiveMap.has(pauseReactiveMapKey)) {
        pauseReactiveMap.set(pauseReactiveMapKey, 0);
    }
    pauseReactiveMap.set(
        pauseReactiveMapKey,
        pauseReactiveMap.get(pauseReactiveMapKey) + 1
    );
    try {
        action();
    } finally {
        pauseReactiveMap.set(
            pauseReactiveMapKey,
            pauseReactiveMap.get(pauseReactiveMapKey) - 1
        );
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
    private updater: TUpdater;
    setUpdater(newUpdater: TUpdater): boolean {
        if (this.updater) {
            if (shouldShowError) {
                const message =
                    'Вы пытаетесь начать перерисовываться при изменении чужой сущности. ' +
                    'Текущий владелец (кликательно):';
                logger.error(message, this.updater);
            }
            return false;
        }
        this.updater = newUpdater;
        return true;
    }
    isCurrentUpdater(updater: TUpdater): boolean {
        return !!this.updater && this.updater === updater;
    }
    unsetUpdater(updater: TUpdater): boolean {
        if (!this.isCurrentUpdater(updater)) {
            if (shouldShowError) {
                const message =
                    'Вы пытаетесь остановить чужие перерисовки при изменении сущности ' +
                    'или уже остановленные перерисовки. Текущий владелец (кликательно):';
                logger.error(message, this.updater);
            }
            return false;
        }
        this.updater = undefined;
        return true;
    }
    callHandler(...args: unknown[]): void {
        if (this.updater && !pauseReactiveMap.has(this.updater)) {
            this.updater(...args);
        }
    }
}
