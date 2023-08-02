import Control from '../../Control';
import { TWasabyOverReactProps } from '../../interfaces';

/**
 */

type TControl = Control<TWasabyOverReactProps, unknown>;
type TFunction = () => void;

interface IQueueElement {
    next: IQueueElement;
    prev: IQueueElement;
    data: TFunction;
    owner: TControl;
}

export class WasabyHooksQueue {
    private hookPlacement: Map<TControl, IQueueElement> = new Map();
    private head: IQueueElement;
    private tail: IQueueElement;

    /**
     * Если в очереди есть родитель - добавим перед ближайшим.
     * Если нет - добавим в конец очереди.
     */
    enqueue(owner: TControl, hook: TFunction): void {
        if (this.hookPlacement.has(owner)) {
            return;
        }
        const queueElement = this.createQueueElement(hook, owner);
        this.hookPlacement.set(owner, queueElement);

        let parent: TControl = owner.props._physicParent;
        while (parent) {
            if (this.hookPlacement.has(parent)) {
                break;
            }
            parent = parent.props._physicParent;
        }

        this.insertBefore(queueElement, this.hookPlacement.get(parent));
    }

    /**
     * Запуск вызовов очереди хуков, обнуление очереди.
     */
    release(): void {
        let currentElement: IQueueElement = this.head;
        while (currentElement) {
            currentElement.data();

            // Не самая очевидная логика разбора очереди.
            // Вместо полной очистки очереди после запуска будем удалять по одному после вызова хука.
            // Если во время запуска хука добавится другой дальше по очереди - он вызовется в этот запуск.
            // Если же добавится раньше по очереди - в этот запуск он не успел, вызовется в следующий.
            // Такой алгоритм не хуже прошлого: добавление "после" работало так же, добавление "до" просто удалялось.
            // Будет стабильно работать - через пару версий можно перевести на такую же логику
            // класс QueueControlSetStateCaller. https://online.sbis.ru/doc/045e048c-942b-4236-8af3-cb20b30d4592
            // Сейчас там для решения подобной задачи используется две отдельные очереди: текущая и запланированная.
            // Если будут какие-то проблемы - наоборот, здесь придётся разделить очередь на текущую и следующую.
            const nextElement = currentElement.next;
            this.dequeue(currentElement.owner);
            currentElement = nextElement;
        }
    }

    /**
     * Удаление контрола и его хука из очереди, вызывается при анмаунте.
     */
    dequeue(owner: TControl): void {
        const queueElement = this.hookPlacement.get(owner);
        if (!queueElement) {
            return;
        }
        this.hookPlacement.delete(owner);

        const headElement = this.head;
        const tailElement = this.tail;
        if (headElement === queueElement && tailElement === queueElement) {
            this.head = undefined;
            this.tail = undefined;
            return;
        }

        const nextElement = queueElement.next;
        const prevElement = queueElement.prev;
        if (headElement === queueElement) {
            nextElement.prev = undefined;
            this.head = nextElement;
            return;
        }
        if (tailElement === queueElement) {
            prevElement.next = undefined;
            this.tail = prevElement;
            return;
        }
        prevElement.next = nextElement;
        nextElement.prev = prevElement;
    }

    private insertBefore(
        queueElement: IQueueElement,
        refQueueElement: IQueueElement
    ): void {
        if (!this.tail) {
            this.head = queueElement;
            this.tail = queueElement;
            return;
        }
        if (!refQueueElement) {
            const tail = this.tail;
            tail.next = queueElement;
            queueElement.prev = tail;
            this.tail = queueElement;
            return;
        }

        const prevRefQueueElement = refQueueElement.prev;

        queueElement.next = refQueueElement;
        refQueueElement.prev = queueElement;
        if (this.head === refQueueElement) {
            this.head = queueElement;
            return;
        }
        prevRefQueueElement.next = queueElement;
        queueElement.prev = prevRefQueueElement;
    }

    private createQueueElement(
        data: TFunction,
        owner: TControl
    ): IQueueElement {
        return {
            next: undefined,
            prev: undefined,
            data,
            owner,
        };
    }

    // Для отладочного вызова в консоли, в виде структуры сложно отлаживать. Пример использования:
    // inst._$wasabyUpdater.hooksCaller.asyncHooks.toArray().map(x => x.owner._moduleName);
    protected toArray(): IQueueElement[] {
        const result: IQueueElement[] = [];
        for (
            let currentElement = this.head;
            !!currentElement;
            currentElement = currentElement.next
        ) {
            result.push(currentElement);
        }
        return result;
    }
}
