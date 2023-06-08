import { IControlObj } from 'UICore/Ref';

export type TControl = IControlObj['control'];

export const focusCallbacksObjectsSetName = 'focus-callbacks-objects';

export interface IWrapHTMLElement extends Node {
    jquery?: unknown;
    wsControl?: TControlOrCompat;
    _$controls?: IControlObj[];
    0?: IWrapHTMLElement;
}

export type TControlOrCompat = TControl & {
    _container: IWrapHTMLElement;
    getOpener?: () => TControlOrCompat;
    getParent?: () => TControlOrCompat;
    getName?: () => string;
    _isDestroyed?: boolean;
};
