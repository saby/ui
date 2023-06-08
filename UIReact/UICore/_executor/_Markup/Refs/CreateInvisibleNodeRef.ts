import { Control } from 'UICore/Base';
import {
    Responsibility,
    IControlNode,
    IControlObj,
    IResponsibilityHandler,
    INVISIBLE_NODE_HANDLER_TYPE,
} from 'UICore/Ref';
import { TWasabyEvent } from 'UICommon/Events';
import { wasabyEventIntersection, isCustomEvent } from 'UICore/Events';

interface IPathcedNode extends Element {
    controlNodes: IControlNode[];
    _$controls: IControlObj[];
}

export class CreateInvisibleNodeRef extends Responsibility {
    private control: Control;
    private isContainerNode: boolean;
    type: string = INVISIBLE_NODE_HANDLER_TYPE;

    constructor(control: Control, isContainerNode: boolean) {
        super();
        this.control = control;
        this.isContainerNode = isContainerNode;
    }

    private transferEvents(node: IPathcedNode, parent: IPathcedNode): void {
        const events = this.control?.props._$events;
        if (events && Object.keys(events).length) {
            for (const key of Object.keys(events)) {
                // const reactEventName = wasabyEventIntersection[key];
                const eventName = key.split(':');
                const eData = events[key];

                // тут надо как-то перенести событие с invisible-node на родителя
                for (const item of eData) {
                    if (!wasabyEventIntersection['on:' + eventName[1]]) {
                        continue;
                    }

                    const fn = (e) => {
                        if (item instanceof Function) {
                            // props[reactEventName] = eData;
                            item(e);
                            return;
                        }
                        let args;
                        if (isCustomEvent(e)) {
                            args = e.detail;
                        } else {
                            args = [e, ...(item.args || [])];
                        }
                        return item.viewController[item.value].apply(
                            item.viewController,
                            args
                        );
                    };
                    const name = eventName[1];
                    parent.addEventListener(name, fn);
                    const removeNotifyListener = function () {
                        parent.removeEventListener(name, fn);
                    };
                    if (!item.viewController._$needRemoveBeforeUnmount) {
                        item.viewController._$needRemoveBeforeUnmount = [];
                    }
                    item.viewController._$needRemoveBeforeUnmount.push(
                        removeNotifyListener
                    );
                }
            }
        }
    }

    private notExistHandler(
        parent: TWasabyEvent[],
        node: TWasabyEvent[]
    ): boolean {
        let res = true;
        for (const parentVal of parent) {
            for (const nodeVal of node) {
                if (
                    parentVal.viewController[parentVal.value] ===
                    nodeVal.viewController[nodeVal.value]
                ) {
                    res = false;
                    break;
                }
            }
        }
        return res;
    }

    private transferControlNodes(
        node: IPathcedNode,
        parent: IPathcedNode
    ): void {
        if (!node.controlNodes) {
            return;
        }
        for (const controlNode of node.controlNodes) {
            this.patchControlNode(controlNode, parent);
            this.patchControl(controlNode, parent);
        }
        if (!parent.controlNodes) {
            parent.controlNodes = [];
        }
        // надо соблюдать порядок контролов controlNodes
        // сначала должны идти контролы с invisible-node, потом собственные
        for (const controlNode of node.controlNodes.reverse()) {
            parent.controlNodes.unshift(controlNode);
        }
    }

    private transferControls(node: IPathcedNode, parent: IPathcedNode): void {
        if (!node._$controls) {
            return;
        }
        for (const control of node._$controls) {
            this.patchControl(control, parent);
        }
        if (!parent._$controls) {
            parent._$controls = [];
        }
        for (const control of node._$controls.reverse()) {
            parent._$controls.unshift(control);
        }
    }

    private clearNode(node: IPathcedNode): void {
        node.controlNodes = undefined;
        node._$controls = undefined;
    }

    private patchControlNode(
        controlNode: IControlNode,
        newContainer: IPathcedNode
    ): void {
        controlNode.element = newContainer;
    }

    private patchControl(
        controlNode: IControlNode,
        newContainer: IPathcedNode
    ): void {
        controlNode.control._container = newContainer;
    }
    getHandler(): IResponsibilityHandler {
        return (node: IPathcedNode): void => {
            if (!node) {
                return;
            }
            const parent = node.parentNode as IPathcedNode;
            // переносим события, controlNodes, _$controls с invisible-node на ближайщего физического родителя
            if (parent && node) {
                if (this.isContainerNode) {
                    this.transferEvents(node, parent);
                }
                this.transferControlNodes(node, parent);
                this.transferControls(node, parent);
                this.clearNode(node);
            }
        };
    }
}
