// tslint:disable:ban-ts-ignore
import { Component, createElement } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isInit } from 'Application/Initializer';
import { getStateReceiver } from 'Application/Env';
import { IStateReceiverMeta, ISerializableState } from 'Application/State';
import { EMPTY_THEME, getThemeController } from 'UICommon/theme/controller';
import { getResourceUrl, Logger, needToBeCompatible } from 'UICommon/Utils';
import { Options } from 'UICommon/Vdom';
import { makeWasabyObservable, pauseReactive, releaseProperties } from 'UICore/WasabyReactivity';
import cExtend = require('Core/core-extend');
import isNewEnvironment = require('Core/helpers/isNewEnvironment');

import template = require('wml!UICore/_base/Control');
import { IControlState, IErrorConfig, TErrBoundaryOptions } from './interfaces';
import {
    getWasabyContext,
    IWasabyContextValue,
    WasabyContextManager,
    TWasabyContext
} from 'UICore/Contexts';

import { OptionsResolver } from 'UICommon/Executor';

import { WasabyEvents, callNotify } from 'UICore/Events';
import { IWasabyEventSystem } from 'UICommon/Events';
import { TIState, TControlConfig, IControl } from 'UICommon/interfaces';
import { IControlOptions, TemplateFunction } from 'UICommon/Base';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { CreateControlNodeRef } from './Refs/CreateControlNodeRef';
import { goUpByControlTree } from 'UICore/NodeCollector';
import { constants } from 'Env/Env';
import { ErrorViewer } from './ErrorViewer';
import { CreateControlRef } from './Refs/CreateControlRef';
import { CreateHocRef } from './Refs/CreateHocRef';
import {skipChangedOptions} from 'UICommon/Base';

export type IControlConstructor<P = IControlOptions> = React.ComponentType<P>;

export type IControlChildren = Record<string, Element | Control | Control<IControlOptions, {}>>;

let countInst = 1;

const EMPTY_FUNC = () => { return; };

/**
 * Базовый контрол, наследник React.Component с поддержкой совместимости с Wasaby
 * @author Шипин А.А.
 */
export default class Control<TOptions extends IControlOptions = {},
    TState extends TIState = void> extends Component<TOptions, IControlState> implements IControl {
    /**
     * Используется для того, чтобы не вызывать хуки ЖЦ до реального построения контрола.
     */
    private _$controlMounted: boolean = false;
    /**
     * Используется для того, чтобы не перерисовывать компонент, пока не закончится асинхронный beforeMount.
     */
    private _$asyncInProgress: boolean = false;
    /**
     * Блочные опции, заданные в шаблонизаторе для контрола. Нужны, чтобы не сравнивать из при принятии решения
     * о перерисовке, так как эти опции создаются в шаблоне каждый раз заново и по сути всегда одинаковые, они не должны
     * влиять на перерисовку. А internal внутри них должны влиять, это сравнивается отдельно
     */
    private _$blockOptionNames: string[] = [];
    /**
     * Промис формируется до первого рендеринга из _beforeMount промиса и ожидания загрузки стилей
     * Этот Промис нужно также дождаться, прежде чем вызывать _afterMount
     */
    private _$beforeMountPromise: Promise<unknown> = null;
    /**
     * Набор детей контрола, для которых задан атрибут name.
     */
    protected _children: IControlChildren = {};
    /**
     * Шаблон контрола.
     */
    protected _template: TemplateFunction;
    /**
     * Реальные опции контрола. Туда собираются значения из props и context.
     * ВАЖНО: значения могут не совпадать с props в некоторые моменты времени,
     * чтобы в хуках были правильные значения.
     */
    protected _options: TOptions = {} as TOptions;
    /**
     * Опции, который были до рендера контрола, передаются как параметр в хуки
     * жизненного цикла _afterRender и _afterUpdate
     */
    private _oldOptions: TOptions = {} as TOptions;
    /**
     * Версии опций для версионируемых объектов.
     */
    _optionsVersions: Options.IVersions;

    // FIXME: не понимаю зачем объявлять _theme и _styles дважды: здесь и ниже.
    /** @deprecated */
    protected _theme: string[];
    /** @deprecated */
    protected _styles: string[];
    /**
     * Название контрола.
     */
    _moduleName: string;
    reactiveValues: Record<string, unknown>;
    private readonly _instId: string = 'inst_' + countInst++;
    // на этот флаг заточена часть поведения платформенных и прикладных контролов
    // TODO: удалить по задаче https://online.sbis.ru/opendoc.html?guid=fac81b21-02fa-40ea-8be3-071a7eeb74c6
    _destroyed: boolean;

    protected _notify(eventName: string, args?: unknown[], options?: { bubbling?: boolean }): unknown {
        return callNotify(this, eventName, args, options);
    }

    activate(cfg: { enableScreenKeyboard?: boolean, enableScrollToElement?: boolean } = {}): boolean {
        return false;
    }

    // несогласованное API, но используется в engine, и пока нужно для сборки UIReact
    deactivate(): void {
    }

    // Пока что просто для сохрания API в ts. Возможно, нужна будет реализация. Метод используется в роутинге.
    getInstanceId(): string {
        return this._instId;
    }

    _getEnvironment(): object {
        return {};
    }

    protected _container: HTMLElement;

    /**
     * Набор промисов дочерних контролов, которые нужно подождать (потому что они или их дети строились асинхронно).
     * Таким образом будет поддержано правило, что _afterMount и _componentDidMount родителя срабатывает только
     * когда сработали все хуки дочерних контролов (как этом было при wasaby-inferno)
     */
    protected _$childrenPromises: Promise<unknown>[] = [];
    /**
     * Резолвер промиса, который уведомляет родителя о том, что завершилось асинхронное построение.
     * Подробнее {@link UICore/_base/Control#_$childrenPromises}.
     */
    protected _$afterMountResolver?: () => void;

    // TODO: TControlConfig добавлен для совместимости, в 3000 нужно сделать TOptions и здесь, и в UIInferno.
    constructor(props: TOptions | TControlConfig = {}, context?: IWasabyContextValue) {
        super(props as TOptions);
        /*
        Если люди сами задают конструктор, то обычно они вызывают его неправильно (передают только один аргумент).
        Из-за этого контекст может потеряться и не получится в конструкторе вытащить значение из него.
         */
        if (!context) {
            Logger.error(
                `[${this._moduleName}] Неправильный вызов родительского конструктора, опции readOnly и theme могут содержать некорректные значения. Для исправления ошибки нужно передать в родительский конструктор все аргументы.`
            );
            context = {};
        }
        this.state = {
            loading: true,
            // Флаг изменения реактивных свойств на instance, необходим для того, чтобы понять,
            // что необходимо перерисовать компонент
            observableVersion: 0
        };
        const constructor = this.constructor as React.ComponentType;
        // Записываем в статическое поле компонента имя для удобной работы через React DevTools
        if (!constructor.displayName) {
            constructor.displayName = this._moduleName;
        }
        this._optionsVersions = {};
        if (needToBeCompatible(constructor, null, false)) {
            Control.mixCompatible<TOptions, TState>(this, {});
        }
    }

    /**
     * Запускает обновление. Нужен из-за того, что всех переводить на новое название метода не хочется.
     */
    _forceUpdate(): void {
        // При forceUpdate() не вызывается метод shouldComponentUpdate() и хук shouldUpdate()
        // Текущая логика работы wasaby, при изменении на инстансе и _forceUpdate() вызывается shouldUpdate() всегда
        this.setState(({observableVersion}: IControlState) => ({
            observableVersion: observableVersion + 1
        }));
    }

    /**
     * Хук жизненного цикла контрола. Вызывается непосредственно перед установкой контрола в DOM-окружение.
     * @param options Опции контрола.
     * @param contexts Поля контекста, запрошенные контролом.
     * @param receivedState Данные, полученные посредством серверного рендеринга.
     * @remark
     * Первый хук жизненного цикла контрола и единственный хук, который вызывается как на стороне сервера, так и на стороне клиента.
     * Он вызывается до рендеринга шаблона, поэтому обычно используется для подготовки данных для шаблона.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _beforeMount(
        options?: TOptions,
        contexts?: object,
        receivedState?: TState
    ): Promise<TState | void> | TState | void {
        // Do
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
     * @private
     */
    private _beforeFirstRender(options: TOptions): void {
        // Данный метод должен вызываться только при первом построении, поэтому очистим его на инстансе при вызове
        this._beforeFirstRender = undefined;

        const promisesToWait = [];

        const res = this._beforeMount(options, {}, this.ejectReceivedState(options));
        this.saveReceivedState(res, options);

        if (res && res.then) {
            promisesToWait.push(res);
        }

        const cssLoading = Promise.all([
            this.loadThemes(options.theme),
            this.loadStyles()
        ]);
        if (constants.isBrowserPlatform && !this.isDeprecatedCSS() && !this.isCSSLoaded(options.theme)) {
            promisesToWait.push(cssLoading.then(nop));
        }
        if (!options.notLoadThemes) {
            //Если ждать загрузки стилей новой темизации. то мы получаем просадку производительности
            //https://online.sbis.ru/doc/059aaa9a-e123-49ce-b3c3-e828fdd15e56
            this.loadThemeVariables(options.theme);
        }

        if (promisesToWait.length) {
            this._$beforeMountPromise = Promise.all(promisesToWait);
            this._$asyncInProgress = true;
        }
    }

    /**
     * Хук жизненного цикла контрола. Вызывается сразу после установки контрола в DOM-окружение.
     * @param options Опции контрола.
     * @param context Поле контекста, запрошенное контролом.
     * @remark
     * Первый хук жизненного цикла контрола, который вызывается после подключения контрола к DOM-окружению.
     * На этом этапе вы можете получить доступ к параметрам и контексту this._options.
     * Этот хук жизненного цикла часто используется для доступа к DOM-элементам и подписки на события сервера.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _afterMount(options?: TOptions, context?: object): void {
        // Do
    }

    /**
     * Синхронный хук жизненного цикла контрола. Вызывается сразу после установки контрола в DOM-окружение.
     * @param {Object} options Опции контрола.
     * @param {Object} context Поле контекста, запрошенное контролом.
     * @example
     * <pre class="brush: js">
     *    Control.extend({
     *       ...
     *       _componentDidMount(options, context) {
     *          this.subscribeToServerEvents();
     *          this.buttonHeight = this._children.myButton.offsetHeight;
     *       }
     *       ...
     *    });
     * </pre>
     * @remark
     * Первый хук жизненного цикла контрола, который вызывается после подключения контрола к DOM-окружению.
     * На этом этапе вы можете получить доступ к параметрам и контексту this._options.
     * Этот хук жизненного цикла часто используется для доступа к DOM-элементам и подписки на события сервера.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _componentDidMount(options?: TOptions, context?: object): void {
        // Do
    }

    /**
     * Определяет, должен ли контрол обновляться. Вызывается каждый раз перед обновлением контрола.
     *
     * @param options Опции контрола.
     * @param [context] Поле контекста, запрошенное контролом. Параметр считается deprecated, поэтому откажитесь от его использования.
     * @returns {Boolean}
     * * true (значание по умолчанию): контрол будет обновлен.
     * * false: контрол не будет обновлен.
     * @example
     * Например, если employeeSalary является единственным параметром, используемым в шаблоне контрола,
     * можно обновлять контрол только при изменении параметра employeeSalary.
     * <pre class="brush: html">
     *    Control.extend({
     *       ...
     *       _shouldUpdate: function(newOptions, newContext) {
     *          if (newOptions.employeeSalary === this._options.employeeSalary) {
     *             return false;
     *          }
     *       }
     *       ...
     *    });
     * </pre>
     * @remark
     * Хук жизненного цикла контрола вызывается после хука _beforeUpdate перед перестроением шаблона. Этот хук можно использовать для оптимизаций.
     * Вы можете сравнить новые и текущие параметры и вернуть false, если нет необходимости пересчитывать DOM-дерево контрола.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _shouldUpdate(options: TOptions, context?: object): boolean {
        return true;
    }

    /**
     * Хук жизненного цикла контрола. Вызывается перед обновлением контрола.
     * @deprecated
     */
    protected _beforeRender(): void {
        // Do
    }
    /**
     * Хук жизненного цикла контрола. Вызывается перед обновлением контрола.
     *
     * @param newOptions Опции, полученные контролом. Устаревшие опции можно найти в this._options.
     * @param newContext Контекст, полученный контролом. Устаревшие контексты можно найти в this._context.
     * @remark В этом хуке вы можете сравнить новые и старые опции и обновить состояние контрола.
     * В этом хуке, также, вы можете подготовить все необходимое для визуализации шаблона контрола. Часто код в этом блоке схож с кодом в хуке _beforeMount.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _beforeUpdate(newOptions?: TOptions, newContext?: object): void {
        // Do
    }

    /**
     * Хук жизненного цикла контрола. Вызывается после обновления контрола.
     *
     * @param oldOptions Опции контрола до обновления контрола.
     * @param oldContext Поля контекста до обновления контрола.
     * @protected
     */
    protected _afterUpdate(oldOptions?: TOptions, oldContext?: object): void {
        // Do
    }

    protected _afterRender(oldOptions?: TOptions, oldContext?: any): void {
        // Do
    }

    /**
     * Хук жизненного цикла контрола. Вызывается до удаления контрола.
     * @remark Это последний хук жизненного цикла контрола. Контрол не будет существовать после вызова этого хука.
     * Его можно использовать для отмены подписки на события сервера и очистки всего, что было сохранено в памяти.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _beforeUnmount(): void {
        // Do
    }

    private isDeprecatedCSS(): boolean {
        const isDeprecatedCSS =
            this._theme instanceof Array || this._styles instanceof Array;
        if (isDeprecatedCSS) {
            Logger.warn(
                `Стили и темы должны перечисляться в статическом свойстве класса ${this._moduleName}`
            );
        }
        return isDeprecatedCSS;
    }

    private isCSSLoaded(themeName?: string): boolean {
        const themes = this._theme instanceof Array ? this._theme : [];
        const styles = this._styles instanceof Array ? this._styles : [];
        // FIXME: Поддержка старых контролов с подгрузкой тем и стилей из статических полей
        return (this.constructor as typeof  Control).isCSSLoaded(themeName, themes, styles);
    }

    private loadThemes(themeName?: string): Promise<void> {
        const themes = this._theme instanceof Array ? this._theme : [];
        // FIXME: Поддержка старых контролов с подгрузкой тем и стилей из статических полей
        return (this.constructor as typeof  Control).loadThemes(themeName, themes).catch(logError);
    }

    private loadStyles(): Promise<void> {
        const styles = this._styles instanceof Array ? this._styles : [];
        // FIXME: Поддержка старых контролов с подгрузкой тем и стилей из статических полей
        return (this.constructor as typeof  Control).loadStyles(styles).catch(logError);
    }

    private loadThemeVariables(themeName?: string): Promise<void> {
        return (this.constructor as typeof  Control).loadThemeVariables(themeName).catch(logError);
    }

    /**
     * Метод помещает в StateReceiver состояние контрола, полученное из _beforeMount
     * Сработает только если _beforeMount вернул Promise
     * @param beforeMountResult
     * @param options
     * @private
     */
    private saveReceivedState(beforeMountResult: Promise<TState | void> | TState | void, options: TOptions): void {
        if (!beforeMountResult || !isInit()) {
            return;
        }

        const meta: IStateReceiverMeta = {ulid: options.rskey, moduleName: this._moduleName};
        if (beforeMountResult instanceof Promise) {
            return getStateReceiver().register(meta, beforeMountResult);
        }

        getStateReceiver().register(meta, {
            getState: () => (beforeMountResult as Record<string, any>),
            setState: () => void 0
        });
    }

    /**
     * Метод извлекает из StateReceiver состояние контрола
     * @param options
     * @private
     */
    private ejectReceivedState(options: TOptions): TState {
        if (constants.isServerSide || !options.rskey || !isInit()) {
            return;
        }

        const stateReceiver = getStateReceiver();
        if (!stateReceiver || !stateReceiver.register) {
            return;
        }

        let result;
        stateReceiver.unregister?.(options.rskey);
        stateReceiver.register(options.rskey, {
            getState: () => undefined,
            setState: (state) => {
                result = state;
            }
        });
        stateReceiver.unregister?.(options.rskey);

        return result;
    }

    componentDidMount(): void {
        let promisesToWait = [];
        const newOptions = createWasabyOptions(this.props, this.context);

        if (this._$beforeMountPromise) {
            promisesToWait.push(this._$beforeMountPromise);
            this._$beforeMountPromise = null;
        }

        promisesToWait = promisesToWait.concat(this._$childrenPromises);

        if (promisesToWait.length) {
            const afterMountPromise: Promise<void> = new Promise((resolve) => {
                this._$afterMountResolver = resolve;
            });
            newOptions._$parentsChildrenPromises?.push(afterMountPromise);
            Promise.all(promisesToWait).finally(() => {
                this._$asyncInProgress = false;
                if (this._destroyed) {
                    this._$afterMountResolver();
                    return;
                }
                this.setState(
                    {
                        loading: false
                    },
                    () => {
                        const callback = () => {
                            this._$afterMountResolver();
                            this._$afterMountResolver = undefined;
                            this._$childrenPromises = [];
                            this._options = newOptions;
                            this._optionsVersions = Options.collectObjectVersions(this._options);
                            makeWasabyObservable<TOptions, TState>(this);
                            this._componentDidMount(newOptions);
                            setTimeout(() => {
                                if (this._destroyed) {
                                    return;
                                }
                                this._afterMount(newOptions);
                                this._$controlMounted = true;
                            }, 0);
                        };
                        if (this._$childrenPromises.length) {
                            Promise.all(this._$childrenPromises).finally(callback);
                        } else {
                            callback();
                        }
                    }
                );
            });
            this._$asyncInProgress = true;
        } else {
            this._options = newOptions;
            this._optionsVersions = Options.collectObjectVersions(this._options);
            makeWasabyObservable<TOptions, TState>(this);
            this._componentDidMount(newOptions);
            setTimeout(() => {
                if (this._destroyed) {
                    return;
                }
                this._afterMount(newOptions);
                this._$controlMounted = true;
            }, 0);
        }
    }

    shouldComponentUpdate(newProps: TOptions, newState: IControlState): boolean {
        const newOptions = createWasabyOptions(newProps, this.context);
        /*
        Это единственное место, где мы можем позвать _beforeUpdate, если смотреть на схему:
        https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/
        На эту схему есть ссылка в официальной доке, так что она должна быть близка к реальности.
        У нас есть два ограничения на время вызова _beforeUpdate, если мы хотим сохранить порядок вызова хуков:
        1) До вызова шаблона.
        2) До вызова _shouldUpdate.
        Это оставляет нам 2 места:
        1) getDerivedStateFromProps - статичный метод, так что не подходит.
        2) shouldComponentUpdate - мы здесь.
         */
        if (this._$controlMounted) {
            try {
                // необходимо приостановить работу реактивности, чтобы в случае изменения состояния в _beforeUpdate
                // не произошло запуска еще одной перерисовки - перерисовка и так уже запущена
                pauseReactive(this, () => {
                    // TODO: https://online.sbis.ru/opendoc.html?guid=a9962c03-d5ca-432c-bc8b-a244e5a1b1ed
                    this._beforeUpdate(newOptions, {scrollContext: {}});
                });
            } catch (e) {
                logError(e);
            }
        }

        let result = false;

        // Если обновление запустила реактивность, нам надо перерисовать компонент
        if (!result) {
            const reactiveStartUpdate = newState.observableVersion !== this.state.observableVersion;
            if (reactiveStartUpdate) {
                result = true;
            }
        }

        // проверяем закончилась ли фаза загрузки
        if (!result) {
            const componentLoaded = newState.loading !== this.state.loading;
            if (componentLoaded) {
                result = true;
            }
        }

        // проверяем изменились ли атрибуты
        if (!result) {
            const oldAttrs = this._options._$attributes?.attributes || {};
            const newAttrs = newProps._$attributes?.attributes || {};
            const changedAttrs = Options.getChangedOptions(newAttrs, oldAttrs, false, {}, true);

            if (changedAttrs) {
                if (this._shouldUpdate(newOptions)) {
                    result = true;
                }
            }
        }

        // проверяем изменились ли опции
        if (!result) {
            const changedOptions = !!Options.getChangedOptions(
                newProps,
                this._options,
                false,
                this._optionsVersions,
                undefined,
                undefined,
                undefined,
                newProps._$blockOptionNames
            );
            if (changedOptions) {
                if (this._shouldUpdate(newOptions)) {
                    result = true;
                }
            }
        }

        // зовем _beforeRender, но только если перерисовка реально происходит
        if (result) {
            if (this._$controlMounted) {
                try {
                    pauseReactive(this, () => {
                        this._beforeRender();
                    });
                } catch (e) {
                    logError(e);
                }
            }
        }
        return result;
    }

    componentDidUpdate(): void {
        if (this._$controlMounted) {
            const oldOptions = this._oldOptions;
            this._oldOptions = undefined;
            this._options = createWasabyOptions(this.props, this.context);
            this._optionsVersions = Options.collectObjectVersions(this._options);

            if (this._destroyed) {
                return;
            }
            this._afterRender(oldOptions);
            setTimeout(() => {
                if (this._destroyed) {
                    return;
                }
                this._afterUpdate(oldOptions);
            }, 0);
        }
    }

    componentWillUnmount(): void {
        // на этот флаг заточена часть поведения платформенных и прикладных контролов
        // TODO: удалить по задаче https://online.sbis.ru/opendoc.html?guid=fac81b21-02fa-40ea-8be3-071a7eeb74c6
        this._destroyed = true;
        releaseProperties<TOptions, TState>(this);

        if (this._$controlMounted) {
            this._beforeUnmount.apply(this);
        }

        this._forceUpdate = EMPTY_FUNC;
        this.componentWillUnmount = EMPTY_FUNC;
        // Не нужно очищать реактивные свойства
        if (!this.reactiveValues) {
            return;
        }
    }


    render(): React.ReactNode {
        type TCompCnstr = Function & { getDefaultOptions: () => Record<string, unknown> };
        const wasabyDefaultProps: Record<string, unknown> = (this.constructor as TCompCnstr)?.getDefaultOptions?.();
        const wasabyOptions = createWasabyOptions(this.props, this.context, wasabyDefaultProps);
        const { errorViewer = ErrorViewer, errorContainer = ErrorViewer} = this.props;
        /*
        Валидируем опции именно здесь по двум причинам:
        1) Здесь они уже полностью вычислены.
        2) Мы должны попадать сюда при любом построении.
        На propTypes всех не перевели, потому что это не помогло бы - часть опций (readOnly и theme)
        берётся из контекста.
        */
        OptionsResolver.validateOptions(this.constructor, wasabyOptions);

        this._beforeFirstRender?.(wasabyOptions);

        if (this._$asyncInProgress && this.state.loading) {
            if (typeof process !== 'undefined' && !process.versions) {
                Logger.error(`При сборке реакта найден асинхронный контрол ${this._moduleName}. Верстка на сервере не будет построена`, this);
            }
            return getLoadingComponent();
        }

        /**
         * При обработке ошибки используются два пропса errorContainer и errorController,
         * которым по дефолту ставятся класс-заглушка ErrorViewer, что берет ответственность
         * за обработку конфига (errorController) и отрисовку шаблона ошибки (errorContainer).
         * При необходимости можно  пробрасывать нужный errorContainer, errorController.
         */
        if (this.state.hasError) {
            let errorConfig: Promise<IErrorConfig | void> | IErrorConfig | void = this.state.errorConfig;
            // логика обработки ошибки предполагает два рендера.
            // В первом рендере устанавливаем в state ErrorConfig, во втором уже напрямую берем errorConfig из state
            if (!errorConfig) {
                errorConfig = errorViewer.process(this.state.error);
            }
            // если в errorConfig найден промис, значит в errorConfig ссылка на  настоящий errorController
            // в это условие заходим, только при первом рендере
            if ('then' in errorConfig) {
                // здесь добавляем напрямую в state errorConfig, что в итоге приведет к повторному рендеру
                errorConfig.then((cfg: IErrorConfig) => {
                    // @ts-ignore
                    this.state.errorConfig = cfg;
                    this._forceUpdate();
                });
                // на момент первого рендера устанавливаем дефолтную заглушку в качестве конфига
                errorConfig = ErrorViewer.process(this.state.error);
            }
            return React.createElement<TErrBoundaryOptions>(errorContainer, {
                errorConfig,
                theme: this.context.theme
            });
        }

        let realFiberNode;
        let result: React.ReactElement;
        try {
            this._oldOptions = this._options;
            // можем обновить здесь опции, старые опции для хуков будем брать из _oldOptions
            this._options = wasabyOptions;
            realFiberNode = this._template(this, this._options._$attributes, undefined, true);
            while (realFiberNode instanceof Array) {
                realFiberNode = realFiberNode[0];
            }
            const chainOfRef = new ChainOfRef();
            chainOfRef
               .add(new CreateHocRef(this))
               .add(new CreateControlNodeRef(this))
               .add(new CreateControlRef(this))
               .add(new CreateOriginRef(realFiberNode.ref));
            result = {
                ...realFiberNode, ref: (node) => {
                    return chainOfRef.execute()(node);
                }
            };
        } catch (e) {
            logError(e);
            result = null;
        }

        return createElement(
            WasabyContextManager,
            {
                readOnly: wasabyOptions.readOnly,
                theme: wasabyOptions.theme
            },
            result
        );
    }

    destroy() {
        // нужен для правильной работы совместимости.
        // если не будет метода, при makeInstanceCompatible будет подставлен destroy из UI/Base:Control
    }

    /**
     * Контекст с опциями readOnly и theme
     */
    static readonly contextType: TWasabyContext = getWasabyContext();

    /**
     * Массив имен нетемизированных стилей, необходимых контролу.
     * Все стили будут скачаны при создании
     *
     * @static
     * @deprecated Подключать стили необходимо так import 'css!MyModule/library'
     * @example
     * <pre>
     *   static _styles: string[] = ['Controls/Utils/getWidth'];
     * </pre>
     */
    static _styles: string[] = [];
    /**
     * Массив имен темизированных стилей, необходимых контролу.
     * Все стили будут скачаны при создании
     *
     * @static
     * @deprecated {@link /doc/platform/developmentapl/interface-development/themes/ используйте новый способ темизации}
     * @example
     * <pre>
     *   static _theme: string[] = ['Controls/popupConfirmation'];
     * </pre>
     */
    static _theme: string[] = [];
    /**
     * Загрузка стилей и тем контрола
     * @param themeName имя темы (по-умолчанию тема приложения)
     * @param themes массив доп тем для скачивания
     * @param styles массив доп стилей для скачивания
     * @static
     * @method
     * @example
     * <pre class="brush: js">
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadCSS('saby__dark'))
     * </pre>
     */
    static loadCSS(
        themeName?: string,
        themes: string[] = [],
        styles: string[] = []
    ): Promise<void> {
        return Promise.all([
            this.loadStyles(styles),
            this.loadThemes(themeName, themes)
        ]).then(nop);
    }

    /**
     * Загрузка тем контрола
     * @param instThemes опционально дополнительные темы экземпляра
     * @param themeName имя темы (по-умолчанию тема приложения)
     * @static
     * @private
     * @method
     * @example
     * <pre>
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadThemes('saby__dark'))
     * </pre>
     */
    static loadThemes(
        themeName?: string,
        instThemes: string[] = []
    ): Promise<void> {
        const themeController = getThemeController();
        const themes = instThemes.concat(this._theme);
        if (themes.length === 0) {
            return Promise.resolve();
        }
        return Promise.all(
            themes.map((name) => themeController.get(name, themeName))
        ).then(nop);
    }

    /**
     * Вызовет загрузку коэффициентов (CSS переменных) для тем.
     * @param {String} themeName имя темы. Например: "default", "default__cola" или "retail__light-medium"
     * @static
     * @method
     * @example
     * <pre>
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadThemeVariables('default__cola'))
     * </pre>
     */
    static loadThemeVariables(themeName?: string): Promise<void> {
        if (!themeName) {
            return Promise.resolve();
        }
        return getThemeController().getVariables(themeName);
    }

    /**
     * Загрузка стилей контрола
     * @param instStyles (опционально) дополнительные стили экземпляра
     * @static
     * @private
     * @method
     * @example
     * <pre>
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadStyles())
     * </pre>
     */
    static loadStyles(instStyles: string[] = []): Promise<void> {
        const themeController = getThemeController();
        const styles = instStyles.concat(this._styles);
        if (styles.length === 0) {
            return Promise.resolve();
        }
        return Promise.all(
            styles.map((name) => themeController.get(name, EMPTY_THEME))
        ).then(nop);
    }

    /**
     * Удаление link элементов из DOM
     * @param themeName имя темы (по-умолчанию тема приложения)
     * @param instThemes опционально собственные темы экземпляра
     * @param instStyles опционально собственные стили экземпляра
     * @static
     * @method
     */
    static removeCSS(
        themeName?: string,
        instThemes: string[] = [],
        instStyles: string[] = []
    ): Promise<void> {
        const themeController = getThemeController();
        const styles = instStyles.concat(this._styles);
        const themes = instThemes.concat(this._theme);
        if (styles.length === 0 && themes.length === 0) {
            return Promise.resolve();
        }
        const removingStyles = Promise.all(
            styles.map((name) => themeController.remove(name, EMPTY_THEME))
        );
        const removingThemed = Promise.all(
            themes.map((name) => themeController.remove(name, themeName))
        );
        return Promise.all([removingStyles, removingThemed]).then(nop);
    }

    /**
     * Проверка загрузки стилей и тем контрола
     * @param themeName имя темы (по-умолчанию тема приложения)
     * @param instThemes массив доп тем для скачивания
     * @param instStyles массив доп стилей для скачивания
     * @static
     * @method
     */
    static isCSSLoaded(
        themeName?: string,
        instThemes: string[] = [],
        instStyles: string[] = []
    ): boolean {
        const themeController = getThemeController();
        const themes = instThemes.concat(this._theme);
        const styles = instStyles.concat(this._styles);
        if (styles.length === 0 && themes.length === 0) {
            return true;
        }
        return (
            themes.every((cssName) =>
                themeController.isMounted(cssName, themeName)
            ) &&
            styles.every((cssName) =>
                themeController.isMounted(cssName, EMPTY_THEME)
            )
        );
    }

    static mixCompatible<TOption, TState>(ctor: Control<TOption, TState>, cfg: object): void {
        if (requirejs.defined('Core/helpers/Hcontrol/makeInstanceCompatible')) {
            const makeInstanceCompatible = requirejs('Core/helpers/Hcontrol/makeInstanceCompatible');
            makeInstanceCompatible(ctor, cfg);
        } else {
            Logger.error(`Попытка подмешать совместимость контролу, но makeInstanceCompatible не был подгружен.
            Компонент - ${ctor._moduleName}`);
        }
    }

    /**
     * Создаёт и монтирует контрол на элемент
     * @param ctor Конструктор контрола.
     * @param cfg Опции контрола.
     * @param domElement Элемент, на который должен быть смонтирован контрол.
     */
    static createControl<P extends IControlOptions, T extends HTMLElement & { eventSystem?: IWasabyEventSystem }>(
        ctor: IControlConstructor<P>,
        cfg: P,
        domElement: T
    ): Control {
        if (domElement) {
            // если пришел jquery, вытащим оттуда элемент. Это нужно для старых страниц
            domElement = domElement[0] || domElement;
        }

        // кладём в конфиг наследуемые опции, чтобы они попали в полноценные опции
        cfg.theme = cfg.theme ?? 'default';
        cfg.readOnly = cfg.readOnly ?? false;
        WasabyEvents.initInstance(domElement);
        const result = ReactDOM.render(React.createElement(ctor, cfg), domElement);

        if (result instanceof Control) {
            const compatible = Control.configureCompatibility(domElement, cfg, ctor);
            cfg._$createdFromCode = true;
            if (compatible) {
                Control.mixCompatible(result, cfg);
            }
            return result;
        }
    }

    static configureCompatibility(domElement: HTMLElement, cfg: any, ctor: any): boolean {
        if (!constants.compat) {
            return false;
        }

        // вычисляем родителя физически - ближайший к элементу родительский контрол
        const parent = cfg.parent || goUpByControlTree(domElement)[0];

        if (needToBeCompatible(ctor, parent)) {
            cfg.element = domElement;

            if (parent && parent._options === cfg) {
                Logger.error('Для создания контрола ' + ctor.prototype._moduleName +
                    ' в качестве конфига был передан объект с опциями его родителя ' + parent._moduleName +
                    '. Не нужно передавать чужие опции для создания контрола, потому что они могут ' +
                    'изменяться в процессе создания!', this);
            } else {
                cfg.parent = cfg.parent || parent;
            }
            return true;
        } else {
            return !isNewEnvironment();
        }
    }

    /**
     * Старый способ наследоваться
     * @param mixinsList массив миксинов либо расширяющий класс (если один аргумент)
     * @param hackClass расширяюший класс
     */
    static extend(mixinsList: object | object[], hackClass?: Function): Control {
        return cExtend(this, mixinsList, hackClass);
    }

    static getDerivedStateFromError(error: unknown): { hasError: boolean, error: unknown } {
        return {hasError: true, error};
    }
}

/*
FIXME: если я правильно понимаю, это сделано для того, чтобы _template
инициализировался не в конструкторе, а всего один раз. Но ведь того же самого
можно было добиться через статическое поле.
 */
Object.assign(Control.prototype, {
    _template: template
});
// нужно для совместимости, чтобы перебить _notify совместимым, который будет учитывать EventBus
((Control.prototype as any)._notify as any)._isVdomNotify = true;

function logError(e: Error): void {
    Logger.error(e.message);
}

/**
 * Подмешивает к реактовским опциям значения theme и readOnly из контекста.
 * Если в реактовских опциях были какие-то значения, то возьмутся они.
 * @param props Опции из реакта.
 * @param contextValue Контекст с наследуемыми опциями.
 */
function createWasabyOptions<T extends IControlOptions>(
    props: T,
    contextValue: IWasabyContextValue,
    wasabyDefaulotProps?: Record<string, unknown> | undefined
): T {
    // клон нужен для того, чтобы не мутировать реактовские опции при подкладывании readOnly и theme
    const newProps = { ...wasabyDefaulotProps, ...props };
    newProps.readOnly = props.readOnly ?? contextValue?.readOnly;
    newProps.theme = props.theme ?? contextValue?.theme;
    return newProps;
}

// На данном этапе рисуем индикатор вместо компонента в момент загрузки асинхронного beforeMount
function getLoadingComponent(): React.ReactElement {
    return createElement('img', {
        src: getResourceUrl(
            '/cdn/LoaderIndicator/1.0.0/ajax-loader-indicator.gif'
        ),
        style: {maxWidth: '32px', maxHeight: '32px'}
    });
}


const nop = () => undefined;
