/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { Responsibility, IResponsibilityHandler, FOCUS_HANDLER_TYPE } from 'UICore/Ref';
import { focusCallbacksObjectsSetName } from 'UICore/NodeCollector';
import type {
    IFocusCallbacksObject,
    TFocusChangedCallback,
    THTMLElementWithFocusCallbacksSet,
} from './IFocusComponent';

export class CreateFocusCallbacksRef extends Responsibility {
    type: string = FOCUS_HANDLER_TYPE;
    private focusCallbacksObject: IFocusCallbacksObject;

    constructor(onActivated?: TFocusChangedCallback, onDeactivated?: TFocusChangedCallback) {
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

    getOnActivated(): TFocusChangedCallback | undefined {
        return this.focusCallbacksObject.onActivated;
    }

    setOnActivated(nextOnActivated: TFocusChangedCallback | undefined) {
        this.focusCallbacksObject.onActivated = nextOnActivated;
    }

    getOnDeactivated(): TFocusChangedCallback | undefined {
        return this.focusCallbacksObject.onDeactivated;
    }

    setOnDeactivated(nextOnDeactivated: TFocusChangedCallback | undefined) {
        this.focusCallbacksObject.onDeactivated = nextOnDeactivated;
    }

    private unmountRef(): void {
        const focusCallbacksObject: Set<IFocusCallbacksObject> | undefined =
            this.focusCallbacksObject._container?.[focusCallbacksObjectsSetName];
        if (focusCallbacksObject) {
            focusCallbacksObject.delete(this.focusCallbacksObject);
            this.focusCallbacksObject._container = undefined;
        }
    }

    private mountRef(node: THTMLElementWithFocusCallbacksSet): void {
        if (!node[focusCallbacksObjectsSetName]) {
            node[focusCallbacksObjectsSetName] = new Set();
        }
        const focusCallbacksObject: Set<IFocusCallbacksObject> = node[focusCallbacksObjectsSetName];
        focusCallbacksObject.add(this.focusCallbacksObject);
        this.focusCallbacksObject._container = node;
    }

    private handler(node: THTMLElementWithFocusCallbacksSet | null): void {
        if (node) {
            return this.mountRef(node);
        }
        this.unmountRef();
    }

    getHandler(): IResponsibilityHandler {
        return this.handler;
    }
}
