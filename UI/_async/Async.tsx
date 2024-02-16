import { ReactNode, Component, JSXElementConstructor } from 'react';
import { isLoaded, loadSync, loadAsync, unloadSync } from 'WasabyLoader/ModulesLoader';
import { parse } from 'WasabyLoader/Library';
import { addPageDeps } from 'UI/Deps';
import { Logger } from 'UI/Utils';
import { CommonUtils } from 'UI/Executor';

interface IAsyncProps {
    componentName: string;
    componentProps?: Record<string, unknown>;
    onComponentLoad?: () => {};
    children?: ReactNode;
    className?: string;
}

interface IAsyncState {
    currentComponentName?: string;
    component?: JSXElementConstructor<any>;
    error?: boolean;
    userErrorMessage?: string;
}

type TContentConstructor = JSXElementConstructor<any> | undefined;

const isServerSide = typeof window === 'undefined';

/**
 * Компонент для асинхронной загрузки контролов
 * @private
 */
export default class Async extends Component<IAsyncProps, IAsyncState> {
    /**
     * Флаг для того, чтобы избежать повторной загрузки шаблона, при изменении опций до окончания асинхронной загрузки
     */
    protected asyncLoading: boolean = false;

    /**
     * Флаг, о том, что произошла ошибка при загрузке модуля - чтобы не было циклической попытки загрузки
     */
    private loadingErrorOccurred: boolean = false;

    private defaultErrorMessage: string = 'У СБИС возникла проблема';

    /**
     * Флаг чтобы понимать, что был загружен контрол и вставлен на страницу -
     * т.к. после построения нужно будет вызвать коллбек onComponentLoad
     */
    private needNotifyOnLoad: boolean = false;

    constructor(props: IAsyncProps) {
        super(props);

        if (!props.componentName) {
            const error =
                'В модуль Async передали не корректное имя шаблона (componentName=undefined|null|empty)';
            Logger.error(error);
            this.state = {};
            return;
        }

        let state: IAsyncState = {};
        if (isServerSide || isLoaded(props.componentName)) {
            const component = this._loadContentSync(props.componentName);
            state = {
                component,
                currentComponentName: props.componentName,
                error: !component,
            };
        }

        if (state.error) {
            state.userErrorMessage = this.defaultErrorMessage;
        }

        this.state = state;
    }

    componentDidMount(): void {
        if (this.state.component) {
            this._callOnComponentLoad();
            return;
        }

        this._loadContentAsync(this.props.componentName);
    }

    componentDidUpdate(): void {
        if (this.asyncLoading) {
            return;
        }

        if (this.loadingErrorOccurred) {
            this.loadingErrorOccurred = false;
            return;
        }

        if (this.state.currentComponentName === this.props.componentName) {
            this._callOnComponentLoad();
            return;
        }

        if (isLoaded(this.props.componentName)) {
            const component = this._loadContentSync(this.props.componentName);
            this.setState({
                currentComponentName: this.props.componentName,
                component,
                error: false,
            });
            return;
        }

        this._loadContentAsync(this.props.componentName);
    }

    render() {
        if (this.state.error || !this.state.component) {
            return <div className={this.props.className}>{this.state.userErrorMessage}</div>;
        }

        if (this.state.currentComponentName === this.props.componentName) {
            this._callOnComponentLoad();
        }

        if (!this.props.children) {
            return (
                <this.state.component
                    className={this.props.className}
                    {...this.props.componentProps}
                />
            );
        }

        return (
            <this.state.component className={this.props.className} {...this.props.componentProps}>
                {this.props.children}
            </this.state.component>
        );
    }

    private _callOnComponentLoad(): void {
        if (this.needNotifyOnLoad && !this.state.error && !this.asyncLoading) {
            this.needNotifyOnLoad = false;
            this.props.onComponentLoad?.();
        }
    }

    private _loadContentSync(componentName: string): TContentConstructor {
        const loaded = this._loadSync(componentName);
        if (!loaded) {
            return;
        }

        this.needNotifyOnLoad = true;
        addPageDeps([parse(componentName).name]);
        return getComponent(loaded);
    }

    private _loadSync<T = TContentConstructor>(name: string): T | undefined {
        try {
            const loaded = loadSync<T>(name);
            if (loaded) {
                return loaded;
            }
        } catch (err) {
            Logger.error(`Couldn't load module "${name}"`, err);
        }
    }

    private _loadContentAsync(componentName: string): Promise<void> {
        this.asyncLoading = true;
        this.loadingErrorOccurred = false;

        return this._loadAsync(componentName).then(
            (loaded) => {
                this.asyncLoading = false;
                if (!loaded) {
                    this.loadingErrorOccurred = true;
                    const error = generateErrorMsg(componentName);
                    Logger.warn(error);
                    this.setState({ error: true, userErrorMessage: this.defaultErrorMessage });
                    return;
                }

                this.needNotifyOnLoad = true;
                this.setState({
                    currentComponentName: componentName,
                    component: getComponent(loaded),
                    error: false,
                });
            },
            (err) => {
                this.asyncLoading = false;
                this.loadingErrorOccurred = true;
                this.setState({ error: true, userErrorMessage: err.message });
            }
        );
    }

    private _loadAsync(name: string): Promise<TContentConstructor> {
        return loadAsync<TContentConstructor>(name).catch((error) => {
            Logger.error(`Couldn't load module "${name}"`, error);
            unloadSync(name);
            throw new Error(this.defaultErrorMessage);
        });
    }

    static displayName: string = 'UI/Async:Async';
}

function generateErrorMsg(componentName: string, msg?: string): string {
    const tTemplate = `Ошибка загрузки контрола "${componentName}"`;
    const tHint =
        'Возможны следующие причины:\n\t \
                  • Ошибка в самом контроле\n\t \
                  • Долго отвечал БЛ метод в _beforeUpdate\n\t \
                  • Контрола не существует';
    return !msg ? `${tTemplate}\n${tHint}` : `${tTemplate}: ${msg}`;
}

function getComponent(component: TContentConstructor): TContentConstructor {
    if (component && CommonUtils.isDefaultExport(component)) {
        // @ts-ignore
        return component.default;
    }
    return component;
}
