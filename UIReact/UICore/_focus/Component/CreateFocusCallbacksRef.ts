import {
    Responsibility,
    IResponsibilityHandler,
    FOCUS_HANDLER_TYPE,
} from 'UICore/Ref';
import { IFocusChangedConfig, IFocusCallbacksObject } from 'UICore/Focus';
import { focusCallbacksObjectsSetName } from 'UICore/NodeCollector';

export class CreateFocusCallbacksRef extends Responsibility {
    type: string = FOCUS_HANDLER_TYPE;
    private focusCallbacksObject: IFocusCallbacksObject;

    constructor(
        onActivated?: (config: IFocusChangedConfig) => void,
        onDeactivated?: (config: IFocusChangedConfig) => void
    ) {
        super();
        this.focusCallbacksObject = {
            isFocusCallbacksObject: true,
            _moduleName: 'focusCallbacksObject',
            _container: undefined,
            onActivated,
            onDeactivated,
        };
        this.handler = this.handler.bind(this);
    }

    getOnActivated(): (config: IFocusChangedConfig) => void {
        return this.focusCallbacksObject.onActivated;
    }

    setOnActivated(nextOnActivated: (config: IFocusChangedConfig) => void) {
        this.focusCallbacksObject.onActivated = nextOnActivated;
    }

    getOnDeactivated(): (config: IFocusChangedConfig) => void {
        return this.focusCallbacksObject.onDeactivated;
    }

    setOnDeactivated(nextOnDeactivated: (config: IFocusChangedConfig) => void) {
        this.focusCallbacksObject.onDeactivated = nextOnDeactivated;
    }

    private unmountRef(): void {
        const focusCallbacksObject: Set<IFocusCallbacksObject> =
            this.focusCallbacksObject._container?.[
                focusCallbacksObjectsSetName
            ];
        if (focusCallbacksObject) {
            focusCallbacksObject.delete(this.focusCallbacksObject);
            this.focusCallbacksObject._container = undefined;
        }
    }

    private mountRef(node: HTMLElement): void {
        if (!node[focusCallbacksObjectsSetName]) {
            node[focusCallbacksObjectsSetName] = new Set();
        }
        const focusCallbacksObject: Set<IFocusCallbacksObject> =
            node[focusCallbacksObjectsSetName];
        focusCallbacksObject.add(this.focusCallbacksObject);
        this.focusCallbacksObject._container = node;
    }

    private handler(node: HTMLElement): void {
        if (node) {
            return this.mountRef(node);
        }
        this.unmountRef();
    }

    getHandler(): IResponsibilityHandler {
        return this.handler;
    }
}
