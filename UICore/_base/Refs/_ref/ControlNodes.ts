/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { Logger } from 'UICommon/Utils';
import { TControlNode } from './TControlNode';
import { IControlNode } from 'UICore/Ref';
import type Control from '../../Control';

interface IHTMLElementWithControlNodes extends HTMLElement {
    controlNodes: IControlNode[];
}

function isHTMLElementWithControlNodes(
    element: HTMLElement
): element is IHTMLElementWithControlNodes {
    return element && typeof element === 'object' && 'controlNodes' in element;
}

function getNumberId(id: string | 0): number {
    return parseInt((id + '').replace('inst_', ''), 10);
}

function sortedAddControlNode(controlNodes: IControlNode[], newControlNode: IControlNode): void {
    const generatedId: number = getNumberId(newControlNode.id);

    // Если массив пустой или все id не меньше чем у новой ноды - добавляем в конец.
    let newIndex: number = controlNodes.length;
    for (let index = 0; index < controlNodes.length; ++index) {
        const id = getNumberId(controlNodes[index].id);

        // Добавляем node перед первой из тех, чей id меньше.
        if (id < generatedId) {
            newIndex = index;
            break;
        }
    }
    controlNodes.splice(newIndex, 0, newControlNode);
}

function addControlNode(controlNodes: IControlNode[], controlNode: IControlNode): void {
    const foundIndex = controlNodes.findIndex((c) => {
        return c.control === controlNode.control;
    });
    const foundControlNode = controlNodes[foundIndex];

    let shouldAddControlNode: boolean = !foundControlNode;
    if (foundControlNode && foundControlNode.id !== controlNode.id) {
        // поскольку контрол ноды отсортированы по id, в случае несовпадения удалим и вставим заново.
        shouldAddControlNode = true;
        controlNodes.splice(foundIndex, 1);
    }

    if (shouldAddControlNode) {
        sortedAddControlNode(controlNodes, controlNode);
        return;
    }
    // Тот же контрол с тем же айди - просто переприсвоим
    controlNodes[foundIndex] = controlNode;
}

function updateControlNode(controlNodes: IControlNode[], controlNode: IControlNode): void {
    const foundIndex = controlNodes.findIndex((c) => {
        return c.control === controlNode.control;
    });
    if (foundIndex > -1) {
        controlNodes[foundIndex] = controlNode;
    }
}

function removeControlNode(
    controlNodes: IControlNode[],
    controlToRemove: Control<unknown, unknown>
): IControlNode[] {
    if (!controlNodes) {
        return [];
    }
    const foundControlNodeIndex = controlNodes.findIndex((controlNode) => {
        return controlNode.control === controlToRemove;
    });

    if (foundControlNodeIndex !== -1) {
        return controlNodes.splice(foundControlNodeIndex, 1);
    }
    return [];
}

export function extractControlNodeFromContainer(
    control: Control<unknown, unknown>
): IControlNode[] {
    const element = control._container;
    if (!isHTMLElementWithControlNodes(element)) {
        return [];
    }
    return removeControlNode(element.controlNodes, control);
}

export function prepareControlNodes(node: TControlNode, control: Control<unknown, unknown>): void {
    if (node?._beforeMount && !node._container) {
        // если контрол еще без контейнера (асинхронный он или его дети) - ничего делать не надо
        return;
    }
    const container = node?._container || node;
    if (!container) {
        return;
    }

    container.controlNodes = container.controlNodes || [];
    const controlNode: IControlNode = {
        control,
        parent: null,
        element: container,
        // @ts-ignore _getEnvironment сейчас private
        environment: control._getEnvironment(),
        id: control._instId,
        events: control.props._$events,
    };
    // @ts-ignore _moduleName сейчас _protected
    const moduleName = control._moduleName;
    Object.defineProperty(controlNode, 'environment', {
        get(): object {
            Logger.error(`Попытка использовать Environment в React окружении,
            необходимо убрать зависимость. Компонент - ${moduleName}`);
            return this.control._getEnvironment();
        },
    });
    updateControlNode(container.controlNodes, controlNode);
    if (control._container !== container) {
        // В идеале это делать, когда реф стреляет null, но пока безопаснее так.
        removeControlNode(control._container?.controlNodes, control);
        addControlNode(container.controlNodes, controlNode);

        if (control._container) {
            // в случае совместимости из-за того что теперь в createControl не заменяется корневой элемент,
            // а вставляется новый внутрь элемента, при подмешивании совместимости (makeInstanceCompatible)
            // неправильно определяется корневой элемент для создаваемого wasaby-контрола.
            // должен был бы проставиться реальный элемент, но совместимость подмешивается на beforeFirstRender,
            // так что элемента еще не существует, а совместимость берет тот элемент, что ему передали в качестве корня.
            // далее, wsControl проставляется на этот элемент, а потом происходит рендер и мы попадаем сюда и
            // проставляем правильный элемент. но wsControl остается висеть неправильным, что вызывает ошибки.
            // Поэтому нужно перевесить wsControl.
            const wsControl = control._container.wsControl;
            delete control._container.wsControl;
            container.wsControl = wsControl;

            // контрол SBIS3.CONTROLS/Mixins/ItemsControlMixin перед удалением верстки вызывает дестрой у контролов
            // в этой верстке, контролы ищет по атрибуту data-component и берет у найденых элементов wsControl.
            // раз уж мы тут перевешиваем wsControl, нужно перевесить и data-component, чтобы контрол смог найтись
            // и удалиться корректно
            const dataComponent = control._container.getAttribute('data-component');
            if (dataComponent) {
                container.setAttribute('data-component', dataComponent);
            }
        }

        // @ts-ignore _container сейчас _protected
        control._container = container;
    }
}
