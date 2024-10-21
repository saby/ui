/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { AdaptiveInitializerInternal } from 'UICore/Adaptive';
import { ReactElement } from 'react';
import { dispatcherHandler } from 'UI/HotKeys';

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
        performance?.mark?.('UI/Bootstrap DidMount');
    }
    render(): ReactElement {
        let className = this.state.preload ? 'pre-load' : '';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div
                style={{ width: 'inherit', height: 'inherit' }}
                className={className}
                ref={this.props.forwardedRef}
                onKeyDown={dispatcherHandler}
            >
                <AdaptiveInitializerInternal>
                    <span className="vdom-focus-in" tabIndex={1} key="vdom-focus-in" />
                    {this.props.children}
                    <span className="vdom-focus-out" tabIndex={0} key="vdom-focus-out" />
                    {this.state.preload && (
                        <div className="preload-overlay" {...{ name: 'loadingOverlay' }}></div>
                    )}
                </AdaptiveInitializerInternal>
            </div>
        );
    }
}
