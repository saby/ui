/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import {
    IControlState,
    IErrorConfig,
    TErrBoundaryOptions,
    TWasabyOverReactProps,
} from 'UICore/_base/interfaces';
import { ErrorViewer } from 'UICore/_base/ErrorViewer';
import * as React from 'react';
import { IWasabyContextValue } from 'UICore/_contexts/WasabyContext';
import { Logger } from 'UICommon/Utils';
import { detection } from 'Env/Env';

declare const window: Window & {
    wsErrorMonitor?: {
        onError(event: unknown): void;
        reason?: string;
    };
};

/**
 * @public
 * Декоратор отрисовки ошибки в Wasaby контрол React
 * В props errorContainer и errorViewer по дефолту лежит класс-заглушка ErrorViewer, который
 * одновременно и обрабатывает конфиг (errorViewer) и отрисовывает шаблон ошибки (errorContainer).
 * Если необходимо пробрасывайте другие errorContainer, errorViewer.
 * @param owner контрол, к которому применяется декоратор
 * @remark
 * Логика обработки ошибки предполагает два рендера.
 * Настоящий errorViewer:
 * 1 render: получить Promise -> в state добавить конфиг -> отрисовать заглушку
 * 2 render: из state использовать конфиг -> отрисовать реальный errorContainer
 * Заглушка:
 * 1 render: получить конфиг -> отрисовать заглушку
 * 2 render: не происходит
 */
export class RenderErrorDecorator {
    private _control: React.Component;
    constructor(control: React.Component) {
        this._control = control;
    }
    private _defineConfig(props: TWasabyOverReactProps, state: IControlState): IErrorConfig {
        const { errorViewer = ErrorViewer } = props;
        let errorConfig: Promise<IErrorConfig | void> | IErrorConfig = state.errorConfig;

        if (!errorConfig) {
            errorConfig = errorViewer.process(state.error);
        }
        // условие выполнится если это первый рендер
        // и если в errorConfig пришёл Promise настоящего errorViewer.
        // В фэйковом errorViewer возвращается всегда конфиг (якобы мы получили его через промис)
        if ('then' in errorConfig) {
            // здесь добавляем errorConfig в state, что в итоге приведет к повторному рендеру
            errorConfig.then((cfg: IErrorConfig) => {
                return this._control.setState({ errorConfig: cfg });
            });
            // на момент первого рендера устанавливаем дефолтную заглушку в качестве конфига
            errorConfig = ErrorViewer.process(state.error);
        }
        return errorConfig;
    }
    renderError(
        props: TWasabyOverReactProps,
        state: IControlState,
        context: IWasabyContextValue
    ): React.ReactElement {
        Logger.error(state.error?.message, undefined, state.error, 'REACT RENDER ERROR');

        // ErrorBoundary не работает на ServerSideRendering, на SSR выводим только ошибку в лог
        if (typeof window === 'undefined') {
            return null;
        }

        if (
            typeof window.wsErrorMonitor !== 'undefined' &&
            !window.wsErrorMonitor.reason &&
            !detection.isIE
        ) {
            const erEvent = new ErrorEvent('REACT RENDER ERROR', {
                error: state.error,
                message: state.error?.message,
            });
            window.wsErrorMonitor.onError(erEvent);
        }
        const { errorContainer = ErrorViewer } = props;
        const errorConfig = this._defineConfig(props, state);
        return React.createElement<TErrBoundaryOptions>(errorContainer, {
            errorConfig,
            theme: context.theme,
        });
    }
}
