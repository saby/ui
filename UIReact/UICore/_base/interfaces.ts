import type { RefObject, RefCallback, ComponentClass } from 'react';
import { IControlOptions } from 'UICommon/Base';
import { IVersionState } from './Control/VersionStateDecorator';
import type { TJsxProps } from 'UICore/Jsx';

export type TWasabyOverReactProps = IControlOptions &
    TJsxProps &
    IPropsFrofTemplate & {
        forwardRef?: RefObject<HTMLElement> | RefCallback<HTMLElement>;
        errorContainer?: ComponentClass;
        errorViewer?: IErrorViewer;
    };

interface IPropsFrofTemplate {
    _$compound?: boolean;
    _$internal?: IControlOptions;
}

export interface IControlState extends IVersionState {
    loading: boolean;
    hasError?: boolean;
    error?: Error;
    errorConfig?: IErrorConfig;
}

/**
 * Интерфейс для конфига ошибки
 * @private
 */
export interface IErrorConfig {
    _errorMessage: string;
    templateName?: string;
    error?: Error;
}

/**
 * Интерфейс пропсов для Компонентов ErrorContainer, ErrorController
 * @private
 */
export interface TErrBoundaryOptions {
    error?: Error;
    errorConfig?: IErrorConfig;
    theme?: string;
}
/**
 * IErrorViewer необходим для отлова и показа ошибки в контроле WasabyOverReact
 * @private
 */
export interface IErrorViewer {
    process(error: Error): Promise<IErrorConfig | void> | IErrorConfig;
}
