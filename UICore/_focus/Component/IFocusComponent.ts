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
 * @callback TFocusChangedCallback
 * @param {UICore/_focus/IFocusChangedConfig} config
 * @returns {void}
 * @public
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
 * @interface UICore/_focus/IFocusChangedConfig
 * @public
 * @description Конфиг событий смены активности activated и deactivated.
 */
/**
 * @name UICore/_focus/IFocusChangedConfig#isTabPressed
 * @cfg {boolean} переведён ли фокус нажатием на Tab
 */
/**
 * @name UICore/_focus/IFocusChangedConfig#isShiftKey
 * @cfg {boolean} переведён ли фокус с нажатой клавишей Shift
 */
/**
 * @name UICore/_focus/IFocusChangedConfig#keyPressedData
 * @cfg {UICommon/Focus:IKeyPressedData} информация из события keydown, если фокус переведён нажатием на любую клавишу клавиатуры.
 */
export interface IFocusChangedConfig {
    isTabPressed: boolean;
    isShiftKey: boolean;
    keyPressedData: IKeyPressedData | null;
}
