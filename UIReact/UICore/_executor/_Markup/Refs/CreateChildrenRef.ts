import { onElementMount, onElementUnmount } from 'UICommon/Executor';
import { Control } from 'UICore/Base';
import {
    Responsibility,
    IResponsibilityHandler,
    CHILDREN_HANDLER_TYPE,
} from 'UICore/Ref';

/**
 * __transferred помечаются контролы, у которых задано свойство _transferChildrenToParent = true
 * это делается для оберток над чистымы реакт контролами чтобы при обращении this._children.method()
 * method вызывался у реального контрола где он описан, и не приходилось его проксировать в обертку
 * другими словами это указание на корневой контрол чистого реакта
 */
const TRANSFERED_TO_PARENT = '__transferred';
export class CreateChildrenRef extends Responsibility {
    private parent: Control<unknown, unknown>;
    private name: string;
    private disabled: boolean;
    /**
     * Коллбек, который отключает ref'ы других детей контрола, у которых такой же name (из-за scope="{{options}}"")
     */
    private setChildrenDisabled: Function;
    type: string = CHILDREN_HANDLER_TYPE;

    constructor(
        parent: Control<unknown, unknown>,
        name: string,
        setChildrenDisabled?: Function
    ) {
        super();
        this.name = name;
        this.parent = parent;
        this.setChildrenDisabled = setChildrenDisabled;
    }

    /**
     * Отключение ref'а для всех детей этого parent с таким же name, после того как будет установлен первый parent._children
     * Будет вызван из метода setChildrenDisabled
     */
    disable(): void {
        this.disabled = true;
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
                return;
            }
            if (this.disabled) {
                return;
            }
            const transferedName = this.name + TRANSFERED_TO_PARENT;
            if (this.parent._transferChildrenToParent) {
                // @ts-ignore children - protected
                this.parent._logicParent._children[transferedName] = node;
            }
            if (this.parent._children[transferedName]) {
                this.parent._children[this.name] =
                    this.parent._children[transferedName];
                delete this.parent._children[transferedName];
            } else {
                this.parent._children[this.name] = node;
            }
            onElementMount(this.parent._children[this.name]);
            this.setChildrenDisabled(this.name);
        };
    }
}
