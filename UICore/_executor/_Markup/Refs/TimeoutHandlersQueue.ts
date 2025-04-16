/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
/**
 * Оптимизация.
 * setTimeout не быстрая операция, и бывает нужно отложить несколько функций за одну синхронную операцию.
 * Класс позволяет выполнить все эти операции из одной синхронной точки, заменяя N таймаутов на 2.
 * @public
 */

type THandler = () => void;

export class TimeoutHandlersQueue {
    private handlersQueue: THandler[] = [];
    constructor(private timeout: number) {}
    addHandler(handler: THandler): void {
        const hasQueue = this.handlersQueue.length;
        this.handlersQueue.push(handler);
        if (hasQueue) {
            return;
        }
        setTimeout(() => {
            // В первый таймаунт сохраним всё, что успели собрать за один тик.
            const currentHandlersQueue = this.handlersQueue;
            this.handlersQueue = [];
            setTimeout(() => {
                // А вот теперь через заданный таймаут запустим сохранённую очередь.
                for (const handlerFromQueue of currentHandlersQueue) {
                    handlerFromQueue();
                }
            }, this.timeout);
        }, 0);
    }
}
