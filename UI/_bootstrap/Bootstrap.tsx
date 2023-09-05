/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { AdaptiveInitializer } from 'UI/Adaptive';
import { ReactElement } from 'react';

interface IBootstrapProps extends TInternalProps {
    children?: ReactElement;
}
interface IBootstrapState {
    preload: boolean;
}

/**
 * Корневой контрол для Wasaby-приложений. Служит для создания базовой разметки.
 * @class UI/Bootstrap
 * @public
 */
export default class Bootstrap extends React.Component<IBootstrapProps, IBootstrapState> {
    constructor(props: IBootstrapProps) {
        super(props);

        this.state = {
            preload: true,
        };
    }
    componentDidMount(): void {
        this.setState({ preload: false });
        // @ts-ignore
        document.body.wasabyLoaded = true;
    }
    render(): ReactElement {
        return (
            <AdaptiveInitializer>
                <div
                    style={{ width: 'inherit', height: 'inherit' }}
                    className={this.state.preload ? 'pre-load' : ''}
                    ref={this.props.forwardedRef}
                >
                    <a className="vdom-focus-in" tabIndex={1} key="vdom-focus-in"></a>
                    {this.props.children}
                    <a className="vdom-focus-out" tabIndex={0} key="vdom-focus-out"></a>
                    {this.state.preload && (
                        <div className="preload-overlay" {...{ name: 'loadingOverlay' }}></div>
                    )}
                </div>
            </AdaptiveInitializer>
        );
    }
}
