/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { WasabyContextManager } from 'UICore/Contexts';
import { TInternalProps } from 'UICore/Executor';
import { create, AdaptiveModeType } from '../Adaptive';
import { ReactElement } from 'react';
import { createElement, delimitProps } from 'UICore/Jsx';

interface IBootstrapProps extends TInternalProps {
    content: any;
    // React.FunctionComponent | React.ComponentClass | React.Component | JSX.Element | string;
}
interface IBootstrapState {
    preload: boolean;
    adaptiveMode?: AdaptiveModeType;
}
interface IDelimitProps {
    clearProps: IBootstrapProps;
    userAttrs: Record<string, string>;
}

function FnComponent({
    content,
    contentProps,
    userAttrs,
}: {
    content: any;
    contentProps: IBootstrapProps & {
        adaptiveMode: AdaptiveModeType;
        isAdaptive?: boolean;
    };
    userAttrs: Record<string, string>;
}): JSX.Element {
    return createElement(content, contentProps, userAttrs, {});
}

/**
 * Корневой контрол для Wasaby-приложений. Служит для создания базовой разметки.
 * @class UI/Bootstrap
 * @public
 */
export default class Bootstrap extends React.Component<
    IBootstrapProps,
    IBootstrapState
> {
    stopChecking?: () => void;

    constructor(props: IBootstrapProps) {
        super(props);

        const breakpointsUtils = create();
        let adaptiveModeInitial;
        this.stopChecking = breakpointsUtils.checkBreakpoint((match) => {
            adaptiveModeInitial = match;
            // проверка что контрол был уже замаунчен
            if (this.state?.preload === false) {
                this.setState({ adaptiveMode: match });
            }
        });

        this.state = {
            preload: true,
            adaptiveMode: adaptiveModeInitial,
        };
    }
    componentDidMount(): void {
        this.setState({ preload: false });
        // @ts-ignore
        document.body.wasabyLoaded = true;
    }
    componentWillUnmount(): void {
        this.stopChecking?.();
    }

    render(): ReactElement {
        const { clearProps, userAttrs } = delimitProps(
            this.props
        ) as IDelimitProps;

        const contentProps: IBootstrapProps & {
            adaptiveMode: AdaptiveModeType;
            isAdaptive?: boolean;
        } = {
            ...clearProps,
            adaptiveMode: this.state.adaptiveMode,
        };
        if (typeof window !== 'undefined') {
            // todo пока нет поддержки на сервере
            //  https://online.sbis.ru/opendoc.html?guid=1aa0022f-77d5-442d-a59a-52220e3fd576&client=3
            contentProps.isAdaptive = !this.state.adaptiveMode.up('lg');
        }

        return (
            <div
                style={{ width: 'inherit', height: 'inherit' }}
                className={this.state.preload ? 'pre-load' : ''}
                ref={this.props.forwardedRef}
            >
                <a
                    className="vdom-focus-in"
                    tabIndex={1}
                    key="vdom-focus-in"
                ></a>
                <WasabyContextManager
                    adaptiveMode={contentProps.adaptiveMode}
                    isAdaptive={contentProps.isAdaptive}
                >
                    <FnComponent
                        content={this.props.content}
                        contentProps={contentProps}
                        userAttrs={userAttrs}
                    />
                </WasabyContextManager>
                <a
                    className="vdom-focus-out"
                    tabIndex={0}
                    key="vdom-focus-out"
                ></a>
                {this.state.preload && (
                    <div
                        className="preload-overlay"
                        {...{ name: 'loadingOverlay' }}
                    ></div>
                )}
            </div>
        );
    }
}
