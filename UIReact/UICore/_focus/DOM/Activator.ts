import { activate, IFocusConfig } from 'UICommon/Focus';

export class Activator {
    constructor(readonly _container: HTMLElement) {}
    activate(cfg: IFocusConfig): boolean {
        return activate(this._container, cfg);
    }
}
