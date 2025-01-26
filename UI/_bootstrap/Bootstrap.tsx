import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { AdaptiveInitializerInternal } from 'UICore/Adaptive';
import { ReactElement } from 'react';
import { FocusEnvironment } from 'UICore/Focus';
import { dispatcherHandler } from 'UI/HotKeys';
import { SyntheticEvent } from 'UI/Events';
import { BootstrapContext } from './BootstrapContext';

interface IBootstrapProps extends TInternalProps {
    children?: ReactElement;
}
interface IBootstrapState {
    preload: boolean;
}

const initialized = { initialized: true };

/**
 * Корневой контрол для Wasaby-приложений. Служит для создания базовой разметки.
 * @class UI/Bootstrap
 * @public
 */
export default class Bootstrap extends React.Component<IBootstrapProps, IBootstrapState> {
    private readonly rootStyle: React.CSSProperties = { width: 'inherit', height: 'inherit' };
    constructor(props: IBootstrapProps) {
        super(props);
        this._keyDownHandler = this._keyDownHandler.bind(this);

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
    protected _keyDownHandler(event: React.KeyboardEvent<HTMLElement>): void {
        // todo ISyntheticEvent надо удалить из hotkeys что-то там не состыкуется
        // @ts-ignore
        dispatcherHandler(new SyntheticEvent<KeyboardEvent>(event));
    }
    render(): ReactElement {
        let className = this.state.preload ? 'pre-load' : '';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        // Если initialized не передался, Bootstrap является корневым,
        // если initialized передался, значит среди родителей уже есть другой Bootstrap.
        if (this.context?.initialized) {
            // Если среди родителей уже есть Bootstrap, не стоит повторно инициализировать то,
            // что уже было среди родителей
            return (
                <div
                    style={{ width: 'inherit', height: 'inherit' }}
                    className={className}
                    ref={this.props.forwardedRef}
                >
                    {this.props.children}
                </div>
            );
        }

        return (
            <BootstrapContext.Provider value={initialized}>
                <FocusEnvironment
                    as="div"
                    style={this.rootStyle}
                    className={className}
                    forwardedRef={this.props.forwardedRef}
                    onKeyDown={this._keyDownHandler}
                >
                    <AdaptiveInitializerInternal>
                        {this.props.children}
                        {this.state.preload && (
                            <div className="preload-overlay" {...{ name: 'loadingOverlay' }}></div>
                        )}
                    </AdaptiveInitializerInternal>
                </FocusEnvironment>
            </BootstrapContext.Provider>
        );
    }
    static contextType: typeof BootstrapContext = BootstrapContext;
    static displayName: string = 'UI/Bootstrap';
}
