import { IControl } from 'UICommon/interfaces';

interface IControlObj {
    control: IControl;
    id: string;
}
export type TControl = IControl;

export const focusCallbacksObjectsSetName = 'focus-callbacks-objects';

export interface IWrapHTMLElement extends Node {
    jquery?: unknown;
    wsControl?: TControlOrCompat;
    _$controls?: IControlObj[];
    0?: IWrapHTMLElement;
}

export type TControlOrCompat = IControl & {
    _container: IWrapHTMLElement;
    getOpener?: () => TControlOrCompat;
    getParent?: () => TControlOrCompat;
    getName?: () => string;
    _isDestroyed?: boolean;
};
