import type Control from '../Control';
import { TWasabyOverReactProps } from '../interfaces';
import QueueControlSetStateCaller from './WasabyUpdater/QueueControlSetStateCaller';
import HooksCaller from './WasabyUpdater/HooksCaller';
import EmptySetTracker from './WasabyUpdater/EmptySetTracker';

type TFunction = () => void;

/**
 */

export default class WasabyUpdater {
    private renderProcess: QueueControlSetStateCaller;
    private runningRenderProcess: QueueControlSetStateCaller;
    private readonly hooksCaller: HooksCaller = new HooksCaller();
    private readonly renderStack: EmptySetTracker = new EmptySetTracker(() => {
        return this.afterUpdateCallback();
    });

    constructor() {
        this.beforeRenderProcess = this.beforeRenderProcess.bind(this);
        this.afterRenderProcess = this.afterRenderProcess.bind(this);
    }

    planUpdate(
        instance: Control<unknown, unknown>,
        updateHandler: TFunction
    ): void {
        this.createRenderProcess();
        this.renderProcess.enqueue(
            instance,
            this.getDepth(instance),
            updateHandler
        );
    }

    registerFirstMountControl(
        instance: Control<unknown, unknown>,
        parent?: Control,
        unmountHook?: TFunction
    ): void {
        this.hooksCaller.registerControl(instance, parent, unmountHook);
    }

    registerUnmountControl(instance: Control<unknown, unknown>): void {
        this.hooksCaller.unregisterControl(instance);
        this.renderProcess?.dequeue(instance);
        this.runningRenderProcess?.dequeue(instance);
        this.renderStack.delete(instance);
    }

    registerBeginRenderControl(instance: Control<unknown, unknown>): void {
        this.renderStack.add(instance);

        // Происходит render, executeDelayed вызовется после окончания обновления.
        this.createRenderProcess();
    }

    registerEndRenderControl(
        instance: Control<unknown, unknown>,
        syncHook?: TFunction,
        asyncHook?: TFunction
    ): void {
        this.hooksCaller.addHook(instance, 'sync', syncHook);
        this.hooksCaller.addHook(instance, 'async', asyncHook);

        this.runningRenderProcess?.dequeue(instance);
        this.renderStack.delete(instance);
    }

    private afterUpdateCallback(): void {
        this.hooksCaller.runHooks('sync');
        setTimeout(() => {
            if (!this.renderStack.size) {
                this.hooksCaller.runHooks('async');
                this.startUpdate();
            }
        }, 0);
    }

    private beforeRenderProcess(): void {
        this.runningRenderProcess = this.renderProcess;
        this.renderProcess = undefined;
        this.renderStack.add(this.runningRenderProcess);
    }

    private afterRenderProcess(): void {
        // Анмаунт хуки не должны дожидаться асинхронность. Как только хоть что-то перерисовалось - вызываем.
        this.renderStack.delete(this.runningRenderProcess);
        this.runningRenderProcess = undefined;
    }

    private createRenderProcess(): void {
        if (this.renderProcess) {
            return;
        }
        this.renderProcess = new QueueControlSetStateCaller(
            this.beforeRenderProcess,
            this.afterRenderProcess
        );
        if (!this.renderStack.size) {
            this.startUpdate();
        }
    }

    private startUpdate(): void {
        if (this.renderProcess) {
            this.renderProcess.executeDelayed();
        }
    }

    // вычисляем вложенность контрола. предполагается, что _physicParent всегда есть, если это не корень
    private getDepth(
        sourceInst: Control<TWasabyOverReactProps, unknown>
    ): number {
        let depth: number = 0;
        let inst: Control<TWasabyOverReactProps, unknown> = sourceInst;
        while (inst?.props?._physicParent) {
            inst = inst?.props?._physicParent;
            depth++;
        }
        return depth;
    }
}
