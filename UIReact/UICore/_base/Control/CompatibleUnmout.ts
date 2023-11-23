import { TimeoutHandlersQueue } from 'UICore/Executor';

const originalJQueryCallTimeout = 5000;
const timeoutHandlersQueue = new TimeoutHandlersQueue(
    originalJQueryCallTimeout
);

/**
 * Есть проблема в случае анмаунта бутерброда wasaby-ws3-wasaby. Задача этого класса - решить эту проблему.
 *
 * У нас получается два процесса анмаунта одновременно. И у внешнего будет выше приоритет.
 * Но в инферно мы заточились, что внутренний анмаунт внутри внешнего мы может вызвать синхронно.
 * А в реакте внутренний wasaby откладывается как менее приоритетный, и вызывается когда уже ws3 удалил DOM.
 * Поэтому мы не будем удалять дом в дестрое ws3, если снаружи есть анмаунт реакта. Костыль, бутерброды зло.
 *
 * @private
 */
class UnmountJQueryPatcher {
    private isPatched: boolean;
    private unmountElement: HTMLElement;

    registerStartUnmount(unmountElement: HTMLElement): void {
        if (!this.unmountElement) {
            this.unmountElement = unmountElement;
        }
    }

    registerEndUnmount(unmountElement: HTMLElement): void {
        if (unmountElement === this.unmountElement) {
            this.unmountElement = null;
        }
    }

    /**
     * Запатчим методы jquery, используемые для зануления DOM в дестрое ws3.
     * Если метод вызывается внутри анмаунта wasaby - ничего не делать. Всё равно потом дерево отсоединится реактом.
     */
    patchJQuery(): void {
        if (this.isPatched || !requirejs.defined('jquery')) {
            return;
        }
        this.isPatched = true;

        const getUnmountElement = () => {
            return this.unmountElement;
        };

        const jquery = requirejs('jquery');

        const originalRemove = jquery.prototype.remove;
        jquery.prototype.remove = function patchedRemove(): unknown {
            const element = this[0];
            const unmountElement = getUnmountElement();
            if (unmountElement && element && unmountElement.contains(element)) {
                const arg = arguments;
                timeoutHandlersQueue.addHandler(() => {
                    originalRemove.apply(this, arg);
                });
                return this;
            }
            return originalRemove.apply(this, arguments);
        };

        const originalEmpty = jquery.prototype.empty;
        jquery.prototype.empty = function patchedEmpty(): unknown {
            const element = this[0];
            const unmountElement = getUnmountElement();
            if (unmountElement && element && unmountElement.contains(element)) {
                const arg = arguments;
                timeoutHandlersQueue.addHandler(() => {
                    originalEmpty.apply(this, arg);
                });
                return this;
            }
            return originalEmpty.apply(this, arguments);
        };
    }
}

export const unmountJQueryPatcher = new UnmountJQueryPatcher();
