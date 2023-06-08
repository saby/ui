// tslint:disbale:ban-ts-ignore
import BeforeMountDecorator from './BeforeMountDecorator';
import { IControlOptions, getGeneratorConfig } from 'UICommon/Base';
import { createElement } from 'react';
import * as React from 'react';
import { TIState } from 'UICommon/interfaces';
import { IControlState, TWasabyOverReactProps } from '../interfaces';
import { IWasabyContextValue, WasabyContextManager } from 'UICore/Contexts';
import { OptionsResolver } from 'UICommon/Executor';
import type Control from '../Control';
import { RenderErrorDecorator } from './RenderErrorDecorator';
import { Runner } from './Runner';
import { IFocusConfig } from 'UICommon/Focus';
import { isUnitTestMode, Logger } from 'UICommon/Utils';
import { getLoadingComponent } from './LoaderIndicator';
import { IWasabyEventSystem } from 'UICommon/Events';
import { IControlConstructor } from '../Control';

export type TWasabyContext = any & Partial<IWasabyContextValue>;

export default class BaseLogic<
    TOptions extends TWasabyOverReactProps = {},
    TState extends TIState = void
> {
    protected readonly inst: Control<TOptions, TState>;

    /**
     * Используется для того, чтобы не перерисовывать компонент, пока не закончится асинхронный beforeMount.
     */
    protected _$beforeMountAsyncInProgress: boolean = false;
    /**
     * сохраняем опции по умолчанию на инстанс для поддержки getDefaultOptions
     */
    protected readonly _$defaultOptions: TOptions;
    /**
     * Блочные опции, заданные в шаблонизаторе для контрола. Нужны, чтобы не сравнивать из при принятии решения
     * о перерисовке, так как эти опции создаются в шаблоне каждый раз заново и по сути всегда одинаковые, они не должны
     * влиять на перерисовку. А internal внутри них должны влиять, это сравнивается отдельно
     */
    // @ts-ignore
    protected _$blockOptionNames: string[] = [];
    protected _beforeMountDecorator: BeforeMountDecorator;
    protected _renderErrorDecorator: RenderErrorDecorator;
    /**
     * Данный класс используется для того, чтобы понимать, что не был вызван _beforeUpdate и его позвать.
     * React иногда не вызывает shouldComponentUpdate, но принимает решение перестроить контрол.
     * В таком случае необходимо позвать _beforeUpdate при вызове render.
     */
    protected _beforeUpdateRun: Runner;
    protected _physicParent: Control<unknown, unknown>;
    // @ts-ignore
    protected _registerAsyncChild: Function;

    constructor(inst: Control<TOptions, TState>, context?: TWasabyContext) {
        this.inst = inst;
        this._physicParent = inst.props._physicParent ?? context?._physicParent;
        this._renderErrorDecorator = new RenderErrorDecorator(this.inst);
        this._beforeMountDecorator = new BeforeMountDecorator();
        this.inst._logicParent =
            inst.props._logicParent ?? context?._logicParent;
        this._$defaultOptions = OptionsResolver.getDefaultOptions(
            this.inst.constructor,
            true
        ) as TOptions;

        this._registerAsyncChild =
            this._beforeMountDecorator.registerAsyncChild;
        // @ts-ignore
        this.inst._children = {};
    }
    logNotRealizedError(name: string): void {
        if (!isUnitTestMode()) {
            const err = new Error(
                'В контроле ' +
                    this.inst._moduleName +
                    ' не реализован метод ' +
                    name +
                    '. ' +
                    'Либо на сервере пытаются запустить метод, который должен использоваться только на клиенте, либо наоборот. ' +
                    'Проверьте, зачем этот метод используется в данном окружении. '
            );
            Logger.error('', this.inst, err);
        }
    }

    _notify(
        control: Control<TOptions, TState>,
        eventName: string,
        args?: unknown[],
        options?: { bubbling?: boolean }
    ): unknown {
        this.logNotRealizedError('_notify');
        return;
    }

    activate(cfg: IFocusConfig = {}): boolean {
        this.logNotRealizedError('activate');
        return false;
    }

    _blur(): void {
        this.logNotRealizedError('_blur');
    }

    _forceUpdate(changedFieldName: string = '_forceUpdate()'): void {
        this.logNotRealizedError('_forceUpdate');
    }

    componentDidMount(checkApiRedefined: () => void): void {
        this.logNotRealizedError('componentDidMount');
    }

    shouldComponentUpdate(
        _shouldUpdate: Function,
        newProps: TOptions,
        newState: IControlState
    ): boolean {
        this.logNotRealizedError('shouldComponentUpdate');
        return false;
    }

    componentDidUpdate(checkApiRedefined: () => void): void {
        this.logNotRealizedError('componentDidUpdate');
    }
    destroy(): void {
        this.logNotRealizedError('destroy');
    }
    componentWillUnmount(): void {
        this.logNotRealizedError('componentWillUnmount');
    }
    protected _getForwardRefResult(
        propsForwardRef?:
            | React.RefObject<HTMLElement>
            | React.RefCallback<HTMLElement>
    ): React.RefCallback<unknown> {
        return null;
    }

    protected beforeRender(wasabyOptions, checkApiRedefined: () => void) {
        return;
    }
    protected callBeforeRenderHook() {
        return;
    }
    protected extractEvents(wasabyOptions) {
        return;
    }
    protected calculateAttributes(): Record<string, unknown> {
        return;
    }
    protected startReactivity() {
        return;
    }

    /**
     * Подготовит опции контрола для безопасной передачи в State Receiver
     * @remark Аргумент options в методе _beforeMount уже очищен от опасных системных ключей.
     * Самостоятельное использование метода имеет смысл в случае работы с this._options.
     * @returns {Object}
     * @static
     * @public
     * @method
     * @example
     * <pre class="brush: js">
     *     import { Control } from 'UI/Base';
     *     _beforeMount(options) {
     *         return {
     *             myData: 42,
     *             myOptions: Control.secureOptionsForStateReceiver(options)
     *         }
     *     }
     * </pre>
     */
    protected secureOptionsForStateReceiver(options: object): object {
        this.logNotRealizedError('secureOptionsForStateReceiver');
        return {};
    }
    protected pauseReactive(action: Function): void {
        action();
    }
    /*
    Раньше этот метод назывался __beforeMount, был публичным и мог вызваться из Markup/Builder.
    Сейчас он специально переименован и сделан приватным, чтобы было явно понятно где он используется.
    По-хорошему, всё построение должно происходить через вызов render, а если захочется пойти
    другим путём - придётся написать комментарий зачем.
     */
    /**
     * Вызывает пользовательский _beforeMount+выполняет работы ядра, которые нужно делать перед построением.
     * @param options Опции контрола.
     * @protected
     */
    protected _beforeFirstRender(options: TOptions): void {
        // Данный метод должен вызываться только при первом построении, поэтому очистим его на инстансе при вызове
        this._beforeFirstRender = undefined;
        this._beforeMountDecorator.initStateReceiver(
            this.inst._moduleName,
            options.rskey
        );
        this._beforeMountDecorator.initThemeController({
            moduleName: this.inst._moduleName,
            themeName: options.theme,
            notLoadThemes: options.notLoadThemes,
            themes: (this.inst.constructor as typeof Control)._theme,
            styles: (this.inst.constructor as typeof Control)._styles,
            // @ts-ignore
            instThemes: this.inst._theme,
            // @ts-ignore
            instStyles: this.inst._styles,
        });

        // Создание res можно оставить тут.
        let res;
        try {
            // @ts-ignore
            res = this.inst._beforeMount(
                this.secureOptionsForStateReceiver(options) as TOptions,
                undefined,
                this._beforeMountDecorator.getReceivedState<TState>()
            );
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }

        this._$beforeMountAsyncInProgress =
            this._beforeMountDecorator.processBeforeMount(
                res,
                (resultDef: unknown): unknown => {
                    this.startReactivity();
                    return resultDef;
                }
            );

        // @ts-ignore надо синхронно поменять стейт и не обновлять его
        this.inst.state.loading = !!this._$beforeMountAsyncInProgress;
    }
    render(
        isCompatibleControl: boolean = false,
        checkApiRedefined: () => void
    ): React.ReactNode {
        let wasabyOptions = this.createWasabyOptions<TOptions>(this.inst.props);
        this.beforeRender(wasabyOptions, checkApiRedefined);

        if (!wasabyOptions._$attributes) {
            // нужно для тестов
            if (Object.isFrozen(wasabyOptions)) {
                wasabyOptions = { ...wasabyOptions };
            }
            wasabyOptions._$attributes = {
                attributes: {},
            };
        }
        // для корневых совместимых wasaby-контролов надо смержить собственные атрибуты с атрибутами,
        //  которые высчитали в makeInstanceCompatible
        // раньше делали это в синхронизаторе, теперь единственная точка тут, т.к. атрибуты надо высчитать до генерации
        if (wasabyOptions._$createdFromCode && this.inst._decOptions) {
            wasabyOptions._$attributes.attributes = {
                ...wasabyOptions._$attributes.attributes,
                ...this.inst._decOptions,
            };
        }
        this.extractEvents(wasabyOptions);

        // можем обновить здесь опции, старые опции для хуков будем брать из _oldOptions
        // @ts-ignore
        this.inst._options = wasabyOptions;

        if (this._$beforeMountAsyncInProgress && this.inst.state.loading) {
            if (typeof process !== 'undefined' && !process.versions) {
                Logger.warn(
                    `При сборке реакта найден асинхронный контрол ${this.inst._moduleName}. Верстка на сервере не будет построена`,
                    this.inst
                );
            }
            return getLoadingComponent(
                this._getForwardRefResult(this.inst.props.forwardRef)
            );
        }

        if (this.inst.state.hasError) {
            return this._renderErrorDecorator.renderError(
                this.inst.props,
                this.inst.state,
                this.inst.context
            );
        }

        let result: React.ReactElement;
        try {
            this.callBeforeRenderHook();
            const attributes = this.calculateAttributes();

            attributes._isRootElement = false;
            // нужно указать флаг что шаблон принадлежит какому-то контролу, только у таких нужно устанавливать флаг
            // isContainerNode (или isContainerNodeInline в случае инлайн шаблона), а в отдельные шаблоны информация
            // о том что этот шаблон в корне прокинется через флаг _isRootElement
            attributes.isControlTemplate = true;
            const generatorConfig = getGeneratorConfig();
            // временное решение до тех пор пока опция темы не перестанет быть наследуемой
            // добавлено тут https://online.sbis.ru/opendoc.html?guid=5a70cc3b-0d05-4071-8ba3-3dd6cd1ba0bd
            // @ts-ignore
            if (this.inst._options._$createdFromCode) {
                if (generatorConfig?.prepareAttrsForRoot) {
                    // @ts-ignore
                    generatorConfig.prepareAttrsForRoot(
                        attributes,
                        this.inst._options
                    );
                }
            }
            // Вызов шаблона через pauseReactive позволяеть убрать использование pauseReactive
            // в UICommon, поскольку работа со скоупом происходит именно внутри него.
            this.pauseReactive(() => {
                // @ts-ignore FIXME нужно поправить TemplateFunctions, что бы все прикладные контролы не развалились
                result = this.inst._template(
                    this.inst,
                    attributes,
                    undefined,
                    !isCompatibleControl,
                    undefined,
                    undefined,
                    generatorConfig
                );
            });
            // в совместимости мы можем строить строки на клиенте и сами их склеивать
            // реакт так строить не позволяет, поэтому нужна обратная совместимость
            if (isCompatibleControl && typeof result === 'string') {
                return result;
            }
            while (result instanceof Array) {
                if (!isCompatibleControl && !result.length) {
                    const message = `
В шаблоне указанного контрола должен быть хотя бы один корневой элемент.
Шаблон не построил верстку, шаблон должен построить хотя бы что-нибудь, хотя бы <invisible-node/>.
Необходимо открыть данный шаблон и проверить, почему верстка в нем не построилась.`;
                    Logger.error(message, this.inst);
                }
                if (result.length > 1) {
                    const message = `
В шаблоне указанного контрола должен быть ТОЛЬКО один корневой элемент.
Шаблон простоит только ПЕРВЫЙ корневой элемент.
Необходимо открыть данный шаблон и проверить, почему в шаблоне несколько корней.
Возможно в корне шаблоне используется ws:for, в таком случае его необходимо обернуть в <div></div>`;
                    Logger.error(message, this.inst);
                }
                result = result[0];
            }

            return createElement(
                WasabyContextManager,
                {
                    readOnly: wasabyOptions.readOnly,
                    theme: wasabyOptions.theme,
                    _physicParent: this.inst,
                    _logicParent: this.inst._logicParent,
                    _parentKey: wasabyOptions.rskey,
                    pageData: wasabyOptions.pageData,
                    Router: wasabyOptions.Router,
                    isAdaptive: wasabyOptions.isAdaptive,
                    adaptiveMode: wasabyOptions.adaptiveMode,
                    moduleName: this.inst._moduleName,
                },
                result
            );
        } catch (e) {
            return this._renderErrorDecorator.renderError(
                this.inst.props,
                { ...this.inst.state, error: e },
                this.inst.context
            );
        }
    }

    /**
     * Для обратной совместимости
     * @deprecated
     */
    mountToDom(element: HTMLElement, cfg: TOptions): void {
        this.logNotRealizedError('mountToDom');
    }
    /**
     * Для обратной совместимости
     * @deprecated
     */
    saveOptions(options: TOptions, controlNode: any = null): boolean {
        // @ts-ignore
        this.inst._options = options as TOptions;
        if (controlNode) {
            // @ts-ignore
            this.inst._container = controlNode.element;
        }
        return true;
    }

    /**
     * Подмешивает к реактовским опциям значения theme и readOnly из контекста.
     * Если в реактовских опциях были какие-то значения, то возьмутся они.
     * @param props Опции из реакта.
     */
    protected createWasabyOptions<T extends IControlOptions>(props: T): T {
        if (props._$key) {
            Logger.warn(
                "Обнаружено использование опции 'key' в " +
                    this.inst._moduleName +
                    '. Для оптимизации построения необходимо переименовать опцию',
                this.inst
            );
        }
        let newProps;
        if (props._$preparedProps && !props._$key) {
            if (Object.keys(this._$defaultOptions).length) {
                newProps = { ...props };
                OptionsResolver.resolveDefaultOptions(
                    newProps,
                    this._$defaultOptions
                );
                return newProps;
            }
            return props;
        }

        // клон нужен для того, чтобы не мутировать реактовские опции при подкладывании readOnly и theme
        newProps = { ...props };
        newProps.readOnly = props.readOnly ?? this.inst.context?.readOnly;
        newProps.theme = props.theme ?? this.inst.context?.theme;
        newProps._registerAsyncChild =
            props._registerAsyncChild ?? this.inst.context?._registerAsyncChild;
        newProps._physicParent =
            props._physicParent ?? this.inst.context?._physicParent;
        newProps.pageData = props.pageData ?? this.inst.context?.pageData;
        newProps.Router = props.Router ?? this.inst.context?.Router;
        newProps.isAdaptive = props.isAdaptive ?? this.inst.context?.isAdaptive;
        newProps.adaptiveMode =
            props.adaptiveMode ?? this.inst.context?.adaptiveMode;
        // восстанавливаем ОПЦИЮ key, чтобы она попала в props
        // надо смотреть на наличие ключа, т.к. может передаваться значение null или 0,
        // на которое могут быть завязаны проверки в хуках
        if (newProps.hasOwnProperty('_$key')) {
            newProps.key = newProps._$key;
        }

        OptionsResolver.resolveDefaultOptions(newProps, this._$defaultOptions);

        return newProps;
    }

    static logNotRealizedError(name: string): void {
        if (!isUnitTestMode()) {
            const err = new Error(
                'Не реализован статический метод ' +
                    name +
                    ' базового контрола. ' +
                    'Либо на сервере пытаются запустить метод, который должен использоваться только на клиенте, либо наоборот. ' +
                    'Проверьте, зачем этот метод используется в данном окружении. '
            );
            Logger.error('', null, err);
        }
    }

    static createControl<
        P extends IControlOptions,
        T extends HTMLElement & { eventSystem?: IWasabyEventSystem }
    >(
        ctor: IControlConstructor<P>,
        cfg: P & { element?: Element },
        domElement: T,
        needHydrate?: boolean
    ): Control {
        BaseLogic.logNotRealizedError('createControl');
        return;
    }
    static destroyControl(
        control: Control<unknown, unknown>,
        element: HTMLElement | [HTMLElement]
    ): void {
        BaseLogic.logNotRealizedError('destroyControl');
    }
    static configureCompatibility(
        domElement: HTMLElement,
        cfg: any,
        ctor: any
    ): boolean {
        BaseLogic.logNotRealizedError('configureCompatibility');
        return false;
    }

    static mixCompatible<TOptions extends TWasabyOverReactProps, TState>(
        ctor: Control<TOptions, TState>,
        cfg: TOptions
    ): void {
        BaseLogic.logNotRealizedError('mixCompatible');
    }

    static getDerivedStateFromError(error: unknown): {
        hasError: boolean;
        error: unknown;
    } {
        return { hasError: true, error };
    }
}
