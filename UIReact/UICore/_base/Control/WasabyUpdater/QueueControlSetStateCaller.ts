import type Control from '../../Control';
import { delay } from 'Types/function';
import { Map, Set } from 'Types/shim';

type TFunction = () => void;
interface IControlUpdateInfo {
    order: number;
    setStateHandler: TFunction;
}

const emptyFunction = () => {
    return undefined;
};

/**
 */

export default class QueueControlSetStateCaller {
    private controlsToSkip: Set<Control<unknown, unknown>> = new Set();
    private plannedUpdates: Map<Control<unknown, unknown>, IControlUpdateInfo> =
        new Map();

    constructor(
        private beforeExecuteCallback?: TFunction,
        private afterExecuteCallback?: TFunction
    ) {}

    enqueue(
        instance: Control<unknown, unknown>,
        order: number,
        setStateHandler: TFunction
    ): void {
        if (!this.plannedUpdates.has(instance)) {
            this.plannedUpdates.set(instance, {
                order,
                setStateHandler,
            });
        }
    }

    dequeue(instance: Control<unknown, unknown>): void {
        this.controlsToSkip.add(instance);
    }

    executeDelayed(): void {
        this.executeDelayed = emptyFunction;
        delay(() => {
            this.beforeExecuteCallback?.();

            const updateQueue = Array.from(this.plannedUpdates);
            updateQueue.sort(this.sortInstancesFunction);

            for (const [instance, { setStateHandler }] of updateQueue) {
                if (!this.controlsToSkip.has(instance)) {
                    setStateHandler();
                }
            }

            // C появлением чистого реакта класс может использоваться синхронным стеком из afterExecuteCallback.
            // Завершим работу с классом более явно, обнулив всё, что возможно.
            this.enqueue = emptyFunction;
            this.dequeue = emptyFunction;
            this.plannedUpdates = undefined;
            this.controlsToSkip = undefined;

            this.afterExecuteCallback?.();
        });
    }

    // сортируем контролы по степени вложенности, так первыми будут контролы, которые выше в иерархии
    // то есть соблюдается правило, что сперва идут более родительсвие контролы, а потом более дочерние
    // не может быть ситуации, что сначала встретится дочерний контрол, а потом его родитель
    // TODO: А нужно ли убирать правильный порядок после выполнения..?
    // https://online.sbis.ru/opendoc.html?guid=f283e7dd-6725-4b8b-8bf3-129
    // https://online.sbis.ru/opendoc.html?guid=07456e4f-2e81-4c34-bf39-d19
    private sortInstancesFunction(
        first: [Control, IControlUpdateInfo],
        second: [Control, IControlUpdateInfo]
    ): number {
        const firstDepth = first[1].order;
        const secondDepth = second[1].order;
        return firstDepth - secondDepth;
    }
}
