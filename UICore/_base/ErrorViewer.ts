/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { IErrorConfig, TErrBoundaryOptions } from 'UICore/_base/interfaces';
import { Component, createElement, createRef, ReactElement, RefObject } from 'react';
import { getResourceUrl } from 'UICommon/Utils';

const getInnerView = (enoughSpace: boolean, props: TErrBoundaryOptions) => {
    const { errorConfig, theme = 'default' } = props;
    const message = createElement('div', { key: 'e12' }, `${errorConfig?._errorMessage}`);

    const imgColor = theme.toLowerCase().includes('dark') ? 'blue' : 'default';
    return enoughSpace
        ? createElement(
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
                  message,
              ]
          )
        : message;
};

/**
 * ErrorViewer, возвращает всегда один и тот же дефолтный шаблон.
 * @private
 */
export class ErrorViewer extends Component<
    TErrBoundaryOptions,
    { enoughSpace: boolean | undefined }
> {
    ref: RefObject<HTMLDivElement>;

    constructor(props: TErrBoundaryOptions) {
        super(props);
        this.state = { enoughSpace: undefined };
        this.ref = createRef();
    }

    render(): ReactElement {
        return createElement(
            'div',
            {
                key: 'e0',
                ref: this.ref,
            },
            [getInnerView(!!this.state.enoughSpace, this.props)]
        );
    }
    componentDidMount(): void {
        if (this.ref?.current !== null && typeof this.state.enoughSpace === 'undefined') {
            const parent = this.ref.current?.parentElement;

            const availableHeight = parent?.clientHeight ?? 0;
            const availableWidth = parent?.clientWidth ?? 0;
            if (
                availableWidth < 166 ||
                (availableWidth >= 275 && availableHeight < 180) ||
                (availableWidth >= 166 && availableWidth < 274 && availableHeight < 132)
            ) {
                this.setState((preState) => {
                    const state = { ...preState };
                    state.enoughSpace = false;
                    return state;
                });
            } else {
                this.setState((preState) => {
                    const state = { ...preState };
                    state.enoughSpace = true;
                    return state;
                });
            }
        }
    }

    static process(error?: Error): IErrorConfig {
        // возвращаем пока всегда один и тот же конфиг
        return {
            _errorMessage: 'Что-то пошло не так',
            error,
        };
    }
}
