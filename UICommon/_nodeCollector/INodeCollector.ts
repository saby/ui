import type { IControl } from 'UICommon/interfaces';
import type { RefObject } from 'react';

interface IControlObj {
    control: IControl;
    id: string;
}
export type TControl = IControl;

export const focusCallbacksObjectsSetName = 'focus-callbacks-objects';
export const focusParentRefName = 'focus-parent-ref';

export interface IWrapHTMLElement extends Node {
    jquery?: unknown;
    wsControl?: TControlOrCompat;
    _$controls?: IControlObj[];
    [focusParentRefName]?: RefObject<HTMLElement>;
    [focusCallbacksObjectsSetName]?: Set<TControl>;
    0?: IWrapHTMLElement;
}

export type TControlOrCompat = IControl & {
    _container: IWrapHTMLElement;
    getOpener?: () => TControlOrCompat;
    getParent?: () => TControlOrCompat;
    getName?: () => string;
    _isDestroyed?: boolean;
    isFocusActivator?: boolean;
};
