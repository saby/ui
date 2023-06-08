import { IErrorConfig, TErrBoundaryOptions } from 'UICore/_base/interfaces';
import { Component, createElement, ReactElement } from 'react';
import { getResourceUrl } from 'UICommon/Utils';

/**
 * ErrorViewer, возвращает всегда один и тот же дефолтный шаблон.
 */
export class ErrorViewer extends Component<TErrBoundaryOptions> {
    render(): ReactElement {
        const { errorConfig, theme = 'default' } = this.props;

        const imgColor = theme.toLowerCase().includes('dark')
            ? 'blue'
            : 'default';

        return createElement(
            'div',
            {
                key: 'e1',
                style: {
                    padding: '50px',
                    maxWidth: '30%',
                    margin: '0 auto',
                    textAlign: 'center',
                },
            },
            [
                createElement('img', {
                    key: 'e11',
                    style: {
                        maxWidth: '100%',
                        maxHeight: '200px',
                        marginBottom: '20px',
                    },
                    src: getResourceUrl(
                        `/cdn/Maintenance/1.1.0/img/NOT_FOUND_${imgColor}.svg`,
                        true
                    ),
                }),
                createElement(
                    'div',
                    { key: 'e12' },
                    `${errorConfig._errorMessage}`
                ),
            ]
        );
    }

    static process(error?: Error): IErrorConfig {
        // возвращаем пока всегда один и тот же конфиг
        return {
            _errorMessage: 'Что-то пошло не так',
            error,
        };
    }
}
