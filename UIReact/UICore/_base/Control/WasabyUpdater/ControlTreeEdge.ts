import Control from '../../Control';

type TFunction = () => void;

/**
 * Класс хранит дерево контролов и служит для вызова unmount хуков в Wasaby порядке (снизу вверх) при его разрушении.
 * @private
 */

export class ControlTreeEdge {
    private children: Map<Control<unknown, unknown>, ControlTreeEdge> =
        new Map();
    constructor(
        private control: Control<unknown, unknown>,
        private parent: ControlTreeEdge,
        private unmountHook: TFunction
    ) {
        if (parent) {
            parent.addChild(this);
        }
    }

    /**
     * Разрушает поддерево с текущего узла, после чего вызывает unmount хуки.
     * При вызове с корня разрушает всё дерево.
     * @private
     */
    destroyTree(): void {
        for (const unmountHook of this.eraseEdge([])) {
            unmountHook();
        }
    }

    private addChild(child: ControlTreeEdge): void {
        this.children.set(child.control, child);
    }

    private removeChild(child: ControlTreeEdge): void {
        this.children.delete(child.control);
    }

    /**
     * Рекурсивно отделяет детей от родителя, собирает хуки.
     * @private
     * @param resultArr массив для пуша хуков.
     * @returns итоговый массив хуков, по ссылке равен resultArr
     */
    private eraseEdge(resultArr: TFunction[]): TFunction[] {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        for (const child of Array.from(this.children.values())) {
            child.eraseEdge(resultArr);
        }
        resultArr.push(this.unmountHook);
        return resultArr;
    }
}
