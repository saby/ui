import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { PrintDialog, AdaptiveInitializerInternal, ScrollOnBodyStore } from 'UICore/Adaptive';
import { ReactElement } from 'react';
import { FocusEnvironment } from 'UICore/Focus';
import { dispatcherHandler } from 'UI/HotKeys';
import { SyntheticEvent } from 'UI/Events';
import { BootstrapContext } from './BootstrapContext';
import { ActionStarter, IActionStartOptions } from 'UICore/Actions';

export interface IHotKeysController {
    get: () => Record<string, IActionStartOptions>;
}
interface IBootstrapProps extends TInternalProps {
    children?: ReactElement;
    HotKeysController: IHotKeysController;
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
    private HotKeysController: IHotKeysController;
    constructor(props: IBootstrapProps) {
        super(props);
        this._keyDownHandler = this._keyDownHandler.bind(this);

        this.state = {
            preload: true,
        };
        this.HotKeysController = props.HotKeysController;
    }
    componentDidMount(): void {
        this.setState({ preload: false });
        // @ts-ignore
        document.body.wasabyLoaded = true;
        performance?.mark?.('UI/Bootstrap DidMount');
    }
    actionHotKeysHandler(event: React.KeyboardEvent<HTMLElement>): boolean {
        const nativeEvent = event.nativeEvent;
        const keyboardEvent = nativeEvent as KeyboardEvent;

        const keys = `${keyboardEvent.metaKey}.${keyboardEvent.ctrlKey}.${keyboardEvent.altKey}.${keyboardEvent.shiftKey}.${keyboardEvent.keyCode}`;
        const actionOptions = this.HotKeysController?.get()[keys];
        if (actionOptions) {
            const actionStarter = new ActionStarter(actionOptions);
            actionStarter.start();
            return true;
        }
        return false;
    }
    protected _keyDownHandler(event: React.KeyboardEvent<HTMLElement>): void {
        const handled = this.actionHotKeysHandler(event);
        if (!handled) {
            // todo ISyntheticEvent надо удалить из hotkeys что-то там не состыкуется
            // @ts-ignore
            dispatcherHandler(new SyntheticEvent<KeyboardEvent>(event));
        }
    }
    render(): ReactElement {
        let className = ScrollOnBodyStore.read('enabled') ? 'adaptiveOverrides__bodyScroll' : '';
        className += this.state.preload ? 'pre-load ' : '';
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
                        <PrintDialog>
                            <>
                                {this.props.children}
                                {this.state.preload && (
                                    <div
                                        className="preload-overlay"
                                        {...{ name: 'loadingOverlay' }}
                                    ></div>
                                )}
                            </>
                        </PrintDialog>
                    </AdaptiveInitializerInternal>
                </FocusEnvironment>
            </BootstrapContext.Provider>
        );
    }
    static contextType: typeof BootstrapContext = BootstrapContext;
    static displayName: string = 'UI/Bootstrap';
}
