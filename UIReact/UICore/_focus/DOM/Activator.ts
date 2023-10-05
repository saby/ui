import { activate, IFocusConfig } from 'UICommon/Focus';
import { __notifyFromReact } from 'UICore/Events';

let counter: number = 0;
export class Activator {
    readonly isFocusActivator: true = true;
    private readonly _instId: string = 'activator_' + counter++;
    unmountCallback?: () => void;
    constructor(readonly _container: HTMLElement) {}
    destroy(): void {
        this.unmountCallback?.();
    }
    activate(cfg: IFocusConfig): boolean {
        return activate(this._container, cfg);
    }
    _notify(eventName: string, args?: unknown[], options?: { bubbling?: boolean }): unknown {
        return __notifyFromReact(this._container, eventName, args, options.bubbling);
    }
    getInstanceId(): string {
        return this._instId;
    }
    // WS3
    getContainer(): HTMLElement {
        return this._container;
    }
}
