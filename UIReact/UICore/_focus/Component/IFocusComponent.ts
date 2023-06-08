import { Control } from 'UICore/Base';
import { IKeyPressedData } from 'UICommon/Focus';

interface TControl extends Control {
    isFocusCallbacksObject: false;
}
export interface IFocusCallbacksObject {
    _container: HTMLElement;
    isFocusCallbacksObject: true;
    _moduleName: string;
    onActivated: (config?: IFocusChangedConfig) => void;
    onDeactivated: (config?: IFocusChangedConfig) => void;
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
    keyPressedData: IKeyPressedData;
}
