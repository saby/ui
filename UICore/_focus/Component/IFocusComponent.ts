/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { Control } from 'UICore/Base';
import { IKeyPressedData } from 'UICommon/Focus';
import { focusCallbacksObjectsSetName } from 'UICore/NodeCollector';

type TControl = Control & {
    isFocusCallbacksObject: false;
    _container: HTMLElement;
};

/**
 * Тип колбека для событий Activated и Deactivated
 * @public
 * @see UICore/Focus:IFocusAreaProps
 */
export type TFocusChangedCallback = (config?: IFocusChangedConfig) => void;

export type THTMLElementWithFocusCallbacksSet = HTMLElement & {
    [focusCallbacksObjectsSetName]?: Set<IFocusCallbacksObject>;
};
export interface IFocusCallbacksObject {
    _container?: THTMLElementWithFocusCallbacksSet;
    isFocusCallbacksObject: true;
    _moduleName: string;
    onActivated?: TFocusChangedCallback;
    onDeactivated?: TFocusChangedCallback;
}

export type TFocusComponent = TControl | IFocusCallbacksObject;

/**
 * Конфиг событий смены активности activated и deactivated
 * @public
 */
export interface IFocusChangedConfig {
    /**
     * переведён ли фокус нажатием на Tab
     */
    isTabPressed: boolean;
    /**
     * переведён ли фокус с нажатой клавишей Shift
     */
    isShiftKey: boolean;
    /**
     * информация из события keydown, если фокус переведён нажатием на любую клавишу клавиатуры
     */
    keyPressedData: IKeyPressedData | null;
}
