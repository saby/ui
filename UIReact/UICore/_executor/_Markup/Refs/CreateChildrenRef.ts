import { onElementMount, onElementUnmount } from 'UICommon/Executor';
import { Activator } from 'UICore/Focus';
import { Control } from 'UICore/Base';
import { Responsibility, IResponsibilityHandler, CHILDREN_HANDLER_TYPE } from 'UICore/Ref';

/**
 * __transferred помечаются контролы, у которых задано свойство _transferChildrenToParent = true
 * это делается для оберток над чистымы реакт контролами чтобы при обращении this._children.method()
 * method вызывался у реального контрола где он описан, и не приходилось его проксировать в обертку
 * другими словами это указание на корневой контрол чистого реакта
 */
const TRANSFERED_TO_PARENT = '__transferred';
export class CreateChildrenRef extends Responsibility {
    private disabled: boolean;
    type: string = CHILDREN_HANDLER_TYPE;

    constructor(
        private parent: Control<unknown, unknown>,
        private name: string,
        /**
         * Коллбек, который отключает ref'ы других детей контрола, у которых такой же name (из-за scope="{{options}}"")
         */
        private setChildrenDisabled?: (name: string, value: boolean) => void,
        private withActivator?: boolean
    ) {
        super();
    }

    /**
     * Отключение ref'а для всех детей этого parent с таким же name, после того как будет установлен первый parent._children
     * ref включается снова, когда стреляет c null.
     * Будет вызван из метода setChildrenDisabled
     */
    disable(value: boolean): void {
        this.disabled = value;
    }

    getHandler(): IResponsibilityHandler {
        if (!this.name || !this.parent) {
            return () => {
                return;
            };
        }
        return (node: HTMLElement) => {
            if (!node) {
                onElementUnmount(this.parent._children, this.name);
                this.setChildrenDisabled(this.name, false);
                return;
            }
            if (this.disabled) {
                return;
            }
            const child =
                this.withActivator && node instanceof HTMLElement ? new Activator(node) : node;
            const transferedName = this.name + TRANSFERED_TO_PARENT;
            if (this.parent._transferChildrenToParent) {
                // @ts-ignore children - protected
                this.parent._logicParent._children[transferedName] = child;
            }
            if (this.parent._children[transferedName]) {
                this.parent._children[this.name] = this.parent._children[transferedName];
                delete this.parent._children[transferedName];
            } else {
                this.parent._children[this.name] = child;
            }
            onElementMount(this.parent._children[this.name]);
            this.setChildrenDisabled(this.name, true);
        };
    }
}
