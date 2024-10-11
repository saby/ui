/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { constants, detection } from 'Env/Env';
import { Set } from 'Types/shim';
import { IControlOptions, getProxyChildren } from 'UICommon/Base';
import { IWasabyEventSystem } from 'UICommon/Events';
import { OptionsResolver } from 'UICommon/Executor';
import { IFocusConfig, activate } from 'UICommon/Focus';
import { TIState } from 'UICommon/interfaces';
import { Logger, needToBeCompatible, isNewEnvironment } from 'UICommon/Utils';
import { callNotify, reactEventList, WasabyEvents, TouchEvents } from 'UICore/Events';
import { goUpByControlTree, startDOMFocusSystem, stopDOMFocusSystem } from 'UICore/Focus';
import { logExecutionTimeBegin, logExecutionTimeEnd } from 'UICore/Jsx';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { makeWasabyObservable, pauseReactive, releaseProperties } from 'UICore/WasabyReactivity';
import { isForwardRef, isComponentClass } from 'UICore/Executor';

import type Control from '../Control';
import { IControlConstructor } from '../Control';
import { IControlState, TWasabyOverReactProps } from '../interfaces';
import { initIntersectionObserver } from '../IntersectionObserver';
import { CreateControlNodeRef } from '../Refs/CreateControlNodeRef';
import { CreateControlRef } from '../Refs/CreateControlRef';
import { initResizeObserver } from '../ResizeObserver';
import { extractControlNodeFromContainer } from '../Refs/_ref/ControlNodes';
import { removeControlObjFromContainer } from '../Refs/_ref/Controls';
import AfterMountDecorator from './AfterMountDecorator';
import AfterUpdateDecorator from './AfterUpdateDecorator';
import BaseLogic, { TWasabyContext } from './BaseLogic';
import ChildrenRefsCreator from './ChildrenRefsCreator';
import { unmountJQueryPatcher } from './CompatibleUnmout';
import purifyInstance, { isPurifyDisabled } from './Purifier/purifyInstance';
import { Runner } from './Runner';
import ShouldComponentUpdateDecorator from './ShouldComponentUpdateDecorator';
import { VersionStateDecorator } from './VersionStateDecorator';
import WasabyUpdater from './WasabyUpdater';
import {
    AdaptiveInitializerInternal,
    applyBodyScroll,
    ScrollOnBodyStore,
    AdaptiveInitializerConfig,
} from 'UICore/Adaptive';
import type {
    TControlOptionsExtended,
    TInternalsCollection,
    TVersionsCollection,
} from 'UICommon/Vdom';
import {
    collectObjectVersions,
    collectInternalsVersions,
    getChangedOptions,
    getChangedInternals,
} from 'UICommon/Vdom';

/**
 * Реакт может анмаунтить только те элементы, на которые был вызвал render.
 * Будем явно сохранять такие элементы.
 */
const rootContainers: Set<HTMLElement> = new Set();

const EMPTY_FUNC = () => {
    return;
};

export default class ClientLogic<
    TOptions extends TWasabyOverReactProps = {},
    TState extends TIState = void,
> extends BaseLogic<TOptions, TState> {
    private _shouldComponentUpdateDecorator: ShouldComponentUpdateDecorator;
    private _afterUpdateDecorator: AfterUpdateDecorator;
    private versionStateDecorator: VersionStateDecorator;

    /**
     * Флаг, что позвался базовый дестрой.
     * В прикладном коде могут спокойно переопределить destroy. По ts это публичный метод.
     * Но у нас слишком много важной логики происходит в дестрое. Поэтому выведем ошибку, если он не позвался.
     * @private
     */
    private _wasLogicDestroyCalled: boolean = false;

    /**
     * Функция вызова _forceUpdate, уникальная по ссылке для каждого контрола. Нужна для реактивности.
     * _forceUpdate могут переприсвоить, поэтому отдельная функция вместо бинда.
     * @private
     * */
    private callForceUpdate: (changedFieldName?: string) => void;

    /** Закэшируем свой forwardRef, чтобы не было лишних перерисовок */
    private _forwardRefResult: React.RefCallback<unknown>;

    /**
     * Версии опций для версионируемых объектов.
     */
    private _optionsVersions: TVersionsCollection;
    /**
     * Версии опций для служебных опций контрола.
     */
    private _internalOptionsVersions: TVersionsCollection;

    /**
     * Опции которые были переданы хуку _beforeMount. Их нужно сохранить чтобы потом, при необходимости,
     * подменить _options перед вызовом _beforeUpdate.
     * @see https://online.sbis.ru/open_dialog.html?guid=3a6f2745-bcc7-4b81-8c29-732bec444851&user=11f1d1c5-8d45-4bc0-bcd7-9745bf8ddebc
     */
    private _beforeMountOptions: TOptions;

    /**
     * Если при вызове _callBeforeUpdate контрол ещё не замаунчен, то в это поле сохраним опции из _beforeMountOptions,
     * чтобы потом подменить _options перед вызовом _beforeUpdate, который позвался из-за _forceUpdate сразу после маунта, поскольку был отложен, пока строился контрол.
     * @see https://online.sbis.ru/open_dialog.html?guid=3a6f2745-bcc7-4b81-8c29-732bec444851&user=11f1d1c5-8d45-4bc0-bcd7-9745bf8ddebc
     */
    private _optionsForBeforeUpdateBeforeMount: TOptions;
    /**
     * флаг, сигнализирующий, что причина следующего обновления будет из-за изменения опции в процессе первой отрисовки.
     * это значит, что при следующем beforeUpdate нужно использовать старые this._options, какими они были бы если бы
     * мы не откладывали запуск перерисовки, а сделали это сразу.
     * Существует кейс, когда в beforeMount делают запрос на БЛ, не возвращая promise из beforeMount.
     * Начинается гонка, иногда результат прилетает еще до того, как первая перерисовка закончилась.
     * Сохранение результата приводит к еще одной перерисовке, но она откладывается нами. А когда эта перерисовка запускается,
     * начинает перерисовываться контрол. Так как он корневой в перерисовке, мы считаем, что родительские опции должны совпадать с новыми,
     * и подменяем this._options = newOptions для beforeUpdate.
     * Измененная опция будет совпадать в новых и старых опциях, но раз она изменилась - она должна отличаться и в beforeUpdate.
     * И раз уж мы сами откладываем обновление и потом зовем forceUpdate создавая ситуацию обновляющегося корневого контрола,
     * нам нужно обеспечить различие в опциях.
     * @private
     */
    private _delayedUpdateDuringMount: Boolean;

    constructor(inst: Control<TOptions, TState>, context?: TWasabyContext) {
        super(inst, context);

        this._shouldComponentUpdateDecorator = new ShouldComponentUpdateDecorator();
        this.versionStateDecorator = new VersionStateDecorator();
        this.inst._$afterMountDecorator = new AfterMountDecorator();
        this._afterUpdateDecorator = new AfterUpdateDecorator();
        this.inst.childrenRefsCreator = new ChildrenRefsCreator(this.inst);
        // @ts-ignore
        this.inst._children = getProxyChildren(this.inst._moduleName);
        // Если нет физического родителя - считаем корнем и создаём новый экземпляр.
        this.inst._$wasabyUpdater = this._physicParent?._$wasabyUpdater || new WasabyUpdater();
        this.callForceUpdate = (changedFieldName?: string) => {
            this.planUpdate(changedFieldName);
        };

        this._beforeUpdateRun = new Runner(this._callBeforeUpdate.bind(this));
    }

    /**
     * Wasaby контрол всегда должен иметь ссылку на свой корневой элемент.
     * Если в корне лежит чистый реакт - он должен прокинуть реф.
     * Поэтому выведем ошибку, если после маунта нет контейнера.
     * @private
     */
    private errorIfNoContainer(): void {
        if (!this.inst._container && !this.inst._destroyed) {
            // Достаточно одной ошибки для каждого контрола.
            this.errorIfNoContainer = EMPTY_FUNC;
            Logger.error(
                `В контроле ${this.inst._moduleName ?? ''} отсутствует _container.
        Вероятные причины:
        - в корне шаблона контрола находится React.Component, который не проставляет ref на свой корневой DOMElement
        - в шаблоне контентной опции больше одного корневого элемента (например, вставлены контролы через ws:for), следует создавать только один корневой элемент
        - шаблон строит пустоту
        Подробнее в базе знаний: https://online.sbis.ru/page/knowledge-bases?baseId=babadcfb-cc27-4589-9b97-9200c2e399ee&article=ae49631c-1a0e-4908-90a2-cea13b7a78e1#toc_af5a6612-2c3c-4080-8bb6-91049514f4ed
`
            );
        }
    }

    protected secureOptionsForStateReceiver(options: object): object {
        return options;
    }

    planUpdate(changedFieldName: string = '_forceUpdate()'): void {
        this.versionStateDecorator.addChangedFieldName(changedFieldName);
        this.inst._$wasabyUpdater.planUpdate(this.inst, () => {
            if (!this.inst._destroyed) {
                this.inst.setState(this.versionStateDecorator.setStateUpdater);
            }
        });
    }

    protected pauseReactive(action: Function): void {
        pauseReactive(this.callForceUpdate, action);
    }

    protected _beforeFirstRender(options: TOptions): void {
        this.inst._$wasabyUpdater.registerFirstMountControl(
            this.inst,
            options._physicParent,
            () => {
                // Совместимость позовёт дестрой раньше.
                if (!this.inst._destroyed) {
                    // @ts-ignore
                    const container = this.inst._container;
                    unmountJQueryPatcher.registerStartUnmount(container);
                    this.inst.destroy();
                    if (!this._wasLogicDestroyCalled) {
                        Logger.error(
                            'Не был вызван базовый destroy контрола. ' +
                                'Убедитесь, что вы не переопределяете destroy вместо использования _beforeUnmount. ' +
                                'https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#before-unmount',
                            this.inst
                        );
                    }
                    unmountJQueryPatcher.registerEndUnmount(container);
                }
            }
        );
        this.inst._$wasabyUpdater.registerBeginRenderControl(this.inst);

        this._optionsVersions = collectObjectVersions(
            options as unknown as TControlOptionsExtended
        );
        this._internalOptionsVersions = collectInternalsVersions(
            options._$internal as unknown as TInternalsCollection
        );

        // подмешивать совместимость надо сверху вниз (в инферно это делали в синхронизаторе)
        if (
            needToBeCompatible(
                this.inst.constructor,
                options.parent || options._physicParent,
                options._$iWantBeWS3
            )
        ) {
            ClientLogic.mixCompatible<TOptions, TState>(this.inst, options);
        }

        super._beforeFirstRender.apply(this, arguments);

        this._beforeMountOptions = options;
        makeWasabyObservable(this.inst, this.callForceUpdate);
    }

    protected beforeRender(wasabyOptions, checkApiRedefined) {
        /*
        Валидируем опции именно здесь по двум причинам:
        1) Здесь они уже полностью вычислены.
        2) Мы должны попадать сюда при любом построении.
        На propTypes всех не перевели, потому что это не помогло бы - часть опций (readOnly и theme)
        берётся из контекста.
        */
        OptionsResolver.validateOptions(this.inst.constructor, wasabyOptions);

        if (this._beforeFirstRender) {
            this._beforeFirstRender(wasabyOptions);
        } else {
            // @ts-ignore
            this.inst._oldOptions = this.inst._options;
            this._beforeUpdateRun.exec(wasabyOptions, true);
            this._beforeUpdateRun.reset();
        }

        checkApiRedefined();
    }
    protected callBeforeRenderHook() {
        if (this.inst._mounted) {
            this.inst._$wasabyUpdater.registerBeginRenderControl(this.inst);
            // зовем _beforeRender, но только если перерисовка реально происходит
            try {
                // @ts-ignore
                this.inst._beforeRender();
            } catch (err) {
                Logger.error(err.message, this.inst, err);
            }
        }
    }

    protected extractEvents(wasabyOptions) {
        this.extractReactEvent(wasabyOptions);
    }
    protected calculateAttributes(): Record<string, unknown> {
        const chainOfRef = new ChainOfRef();
        // @ts-ignore
        if (this.inst._options._$attributes?.refForContainer) {
            // @ts-ignore
            chainOfRef.add(new CreateOriginRef(this.inst._options._$attributes.refForContainer));
        }
        chainOfRef.add(new CreateOriginRef(this._getForwardRefResult()));
        // формируем реф, отправляем до ближайшего элемента
        const refForContainer = chainOfRef.execute();
        const attributes: Record<string, unknown> = {
            // @ts-ignore
            ...(this.inst._options._$attributes || {}),
            refForContainer,
        };
        return attributes;
    }

    render(isCompatibleControl: boolean = false, checkApiRedefined): React.ReactNode {
        this.inst.childrenRefsCreator.clear();
        this.versionStateDecorator.clearChangedFieldNames();

        const start = logExecutionTimeBegin();
        const result = super.render.apply(this, arguments);
        logExecutionTimeEnd(this.inst, start);
        return result;
    }

    _notify(
        control: Control<TOptions, TState>,
        eventName: string,
        args?: unknown[],
        options?: { bubbling?: boolean }
    ): unknown {
        return callNotify(control, eventName, args, options);
    }

    activate(cfg: IFocusConfig = {}): boolean {
        // @ts-ignore
        return activate(this.inst._container, cfg);
    }

    _blur(): void {
        // @ts-ignore
        const container = this.inst._container;
        const activeElement = document.activeElement;

        if (!container || !container.contains(activeElement)) {
            return;
        }

        // задача - убрать фокус с текущего элемента. куда? ну, например на body
        // чтобы можно было перевести фокус на body, сначала выставим табиндекс, а потом уберем
        let tmpTabindex: number;
        if (document.body.tabIndex === -1) {
            tmpTabindex = document.body.tabIndex;
            document.body.tabIndex = 1;
        }

        document.body.focus();

        if (tmpTabindex !== undefined) {
            document.body.tabIndex = tmpTabindex;
        }
    }

    private __$shouldUpdate(options: TOptions): boolean {
        // @ts-ignore
        return this.inst._shouldUpdate(options);
    }

    componentDidMount(checkApiRedefined): void {
        const newOptions = this.createWasabyOptions(this.inst.props);
        try {
            // @ts-ignore
            this.inst._$react_componentDidMount(newOptions);
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }

        if (ScrollOnBodyStore.read('enabled')) {
            applyBodyScroll(this.inst);
        }

        const afterMountFn = () => {
            if (this.inst._destroyed) {
                return;
            }
            try {
                // @ts-ignore
                this.inst._afterMount(newOptions);
            } catch (err) {
                Logger.error(err.message, this.inst, err);
            }
            this._beforeMountDecorator.triggerAfterMount(newOptions as { onAfterMount?: Function });
            this.inst._mounted = true;
            this.inst._$afterMountDecorator.executeDelayedEvent();
            this._shouldComponentUpdateDecorator.reset(this.inst._mounted).fireForceUpdate(() => {
                this._delayedUpdateDuringMount = true;
                this.planUpdate('_delayedUpdateDuringMount');
            });

            checkApiRedefined();
        };
        const didMountFn = () => {
            if (this.inst._destroyed) {
                return;
            }
            this.errorIfNoContainer();
            // @ts-ignore
            this.inst._options = newOptions;

            try {
                // @ts-ignore
                this.inst._componentDidMount(newOptions);
                if (this.inst._$observerCallback) {
                    this.inst._$observerCallback();
                }
            } catch (err) {
                Logger.error(err.message, this.inst, err);
            }
            this._beforeMountDecorator.clearAsyncChild(true);
        };

        const addHooksToQueue = () => {
            this.inst._$wasabyUpdater.registerEndRenderControl(this.inst, didMountFn, afterMountFn);
        };

        if (!this._beforeMountDecorator.hasAsync()) {
            addHooksToQueue();
            return;
        }

        const promise = this._beforeMountDecorator.waitMyOwnAsyncMount().then(() => {
            if (this.inst._destroyed) {
                return;
            }
            return new Promise<void>((resolve) => {
                this.inst.setState(
                    {
                        loading: false,
                    },
                    () => {
                        if (this._beforeMountDecorator.hasAsync()) {
                            return this._beforeMountDecorator
                                .waitMyChildrenAsyncMount()
                                .then(addHooksToQueue)
                                .then(resolve);
                        }
                        addHooksToQueue();
                        resolve();
                    }
                );
            });
        });
        newOptions._registerAsyncChild?.(promise);
    }
    shouldComponentUpdate(
        _shouldUpdate: Function,
        newProps: TOptions,
        newState: IControlState
    ): boolean {
        const { newOptions } = this._prepareDataBeforeUpdate(newProps, newState);
        // Если обновление запустила реактивность или закончилась фаза загрузки - надо перерисовать компонент
        const hasChangesState = () => {
            return (
                this.versionStateDecorator.hasChangesState(newState, this.inst.state) ||
                newState.loading !== this.inst.state.loading
            );
        };

        const hasChangesAttrs = () => {
            const newAttrs = newProps._$attributes?.attributes || {};
            // @ts-ignore
            const oldAttrs = this.inst._options._$attributes?.attributes || {};
            return !!getChangedOptions(
                newAttrs,
                oldAttrs,
                undefined,
                undefined,
                false,
                false,
                true
            );
        };
        const hasChangesOptions = () => {
            const oldProps = this._optionsForBeforeUpdateBeforeMount || this.inst.props;
            return !!getChangedOptions(
                // @ts-ignore TS2345: Argument of type 'TOptions' is not assignable to parameter of type 'IOptions'.
                newProps as unknown as TControlOptionsExtended,
                oldProps as unknown as TControlOptionsExtended,
                this._optionsVersions,
                newProps._$blockOptionNames,
                newProps._$compound,
                newProps._$compound,
                true
            );
        };
        const hasChangesInternalOptions = () => {
            return !!getChangedInternals(
                // @ts-ignore
                newProps._$internal,
                // @ts-ignore
                this.inst._options._$internal,
                this._internalOptionsVersions,
                false,
                false,
                true
            );
        };

        if (newProps._$compound) {
            const err = new Error(
                'Запустилось обновление ws3-контрола в окружении wasaby. ' +
                    'Для вставки ws3-контрола в wasaby нужно использовать CompoundContainer.'
            );
            Logger.error(err.message, undefined, err);
        }
        const reasonsGettersMap = {
            hasChangesState,
            hasChangesAttrs,
            hasChangesOptions,
            hasChangesInternalOptions,
        };

        this._beforeUpdateRun.reset();
        const shouldComponentUpdate = this._shouldComponentUpdateDecorator
            .reset(this.inst._mounted)
            .addReason(reasonsGettersMap)
            .exec();

        if (shouldComponentUpdate.needUpdate) {
            this._beforeUpdateRun.exec(newOptions, shouldComponentUpdate.isOptionsChanged);
        }

        if (shouldComponentUpdate.canContinueExecute) {
            //  _shouldUpdate для не смонтированных контролов,
            // т.к. _shouldUpdate может содержать пользовательскую реализацию, которая может вызывать лишние перерисовки
            let hasShouldUpdate = false;
            try {
                // @ts-ignore
                if (this.inst._shouldUpdate === _shouldUpdate || this.inst._mounted) {
                    hasShouldUpdate = !!this.__$shouldUpdate(newOptions);
                }
            } catch (err) {
                Logger.error(err.message, this.inst, err);
                return true;
            }
            return hasShouldUpdate;
        }

        return shouldComponentUpdate.needUpdate;
    }
    componentDidUpdate(checkApiRedefined): void {
        if (!this.inst._mounted) {
            return;
        }
        const oldOptions = this.inst._oldOptions;
        this.inst._oldOptions = undefined;
        // @ts-ignore
        this.inst._options = this.createWasabyOptions(this.inst.props);
        // @ts-ignore
        this._optionsVersions = collectObjectVersions(this.inst._options);
        // @ts-ignore
        this._internalOptionsVersions = collectInternalsVersions(this.inst._options._$internal);
        try {
            // @ts-ignore
            this.inst._$react_componentDidUpdate(oldOptions);
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }
        const fireSyncHooks = () => {
            if (this.inst._destroyed) {
                return;
            }
            try {
                this.errorIfNoContainer();
                // @ts-ignore
                this.inst._componentDidUpdate(oldOptions);
                // @ts-ignore
                this.inst._afterRender(oldOptions);
                if (this.inst._$observerCallback) {
                    this.inst._$observerCallback();
                }
            } catch (err) {
                Logger.error(err.message, this.inst, err);
            }

            checkApiRedefined();
        };
        const fireAsyncHooks = () => {
            if (this.inst._destroyed) {
                return;
            }

            // @ts-ignore
            this._beforeMountDecorator.triggerAfterUpdate(
                this.inst._options as { onAfterUpdate?: Function }
            );
            try {
                this._afterUpdateDecorator.execute(this.inst, oldOptions);
            } catch (err) {
                Logger.error(err.message, this.inst, err);
            }
        };
        this.inst._$wasabyUpdater.registerEndRenderControl(
            this.inst,
            fireSyncHooks,
            fireAsyncHooks
        );
    }

    componentWillUnmount(): void {
        try {
            // @ts-ignore
            this.inst._$react_componentWillUnmount();
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }
        this.inst._$wasabyUpdater.registerUnmountControl(this.inst);
        this.inst._forceUpdate = EMPTY_FUNC;
        this.inst.componentWillUnmount = EMPTY_FUNC;
        this.inst?._container?.__$scopeEvents = null;
    }
    destroy(): void {
        this.inst._destroyed = true;
        this._wasLogicDestroyCalled = true;

        try {
            releaseProperties(this.inst);
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }

        try {
            if (this.inst._$needRemoveBeforeUnmount) {
                for (const handler of this.inst._$needRemoveBeforeUnmount) {
                    handler();
                }
                this.inst._$needRemoveBeforeUnmount = [];
            }
            if (this.inst._mounted) {
                // @ts-ignore
                this.inst._beforeUnmount.apply(this.inst);
                // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
                (this.inst as any).unmountCallback && (this.inst as any).unmountCallback();
            } else {
                Logger.warn(
                    `у контрола ${this.inst._moduleName} не был вызван _beforeUnmount, потому что он разрушился не успев построиться.
                        Это бывает, когда вызывают асинхронно друг за другом 2 похожих построения контрола,
                        и на второе построение удаляется строящийся контрол из первого построения (например, в цикле ws:for).
                        Это может быть причиной ошибки. Например, как тут https://online.sbis.ru/opendoc.html?guid=07e9d596-e08c-444e-8e18-b437db6a0fb5&client=3
                        Чтобы это ничего не ломало, нельзя в _beforeMount делать подписки и прочие операции, которые потом отменяются в _beforeUnmount.
                        Все подписки должны быть в _afterMount, после отрисовки контрола. _beforeUnmount гарантированно стреляет только если до этого был _afterMount.`,
                    this.inst
                );
            }
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }

        this.inst._forceUpdate = EMPTY_FUNC;
        // @ts-ignore
        this.inst._beforeUnmount = EMPTY_FUNC;
        this.inst._mounted = false;
        this.inst._unmounted = true;

        // Очистим контейнер от лишнего.
        extractControlNodeFromContainer(this.inst);
        removeControlObjFromContainer(this.inst);

        // @ts-ignore
        const controlName = this.inst._options.name;
        // @ts-ignore
        const logicParent = this.inst._options._logicParent;
        if (logicParent && !logicParent._destroyed && logicParent._template && controlName) {
            delete logicParent._children[controlName];
        }

        // У чистого Wasaby контрола нет метода getParent, у совместимого - есть;
        // @ts-ignore
        const isPureWasaby: boolean = !this.inst.getParent;
        if (isPureWasaby && !isPurifyDisabled()) {
            purifyInstance(this.inst, this.inst._moduleName, true);
        }
    }

    /**
     * Для обратной совместимости
     * @deprecated обратная совместимость
     */
    mountToDom(element: HTMLElement, cfg: TOptions): void {
        // @ts-ignore
        if (!this.VDOMReady) {
            // @ts-ignore
            this.VDOMReady = true;
            // @ts-ignore
            this.inst._container = element;
            // удаляем существующий контрол, и создадим такой же чтобы он замаунтился как следует
            ClientLogic.destroyControl(this.inst, element);
            // @ts-ignore игнорируем совместимость
            element.wsControl = undefined;
            // @ts-ignore игнорируем совместимость
            element.controlNodes = undefined;
            // @ts-ignore игнорируем совместимость
            element._$controls = undefined;
            // @ts-ignore игнорируем совместимость
            ClientLogic.createControl(this.inst.constructor, cfg, this.inst._container);
        }
        if (cfg) {
            this.inst.saveOptions(cfg);
        }
    }

    /**
     * Создание нового chainOfRef в render приводило к необоснованным перерисовкам,
     * поскольку хук shouldComponentUpdate считал его важным для перерисовки свойством.
     * @param propsForwardRef
     */
    protected _getForwardRefResult(
        propsForwardRef?: React.RefObject<HTMLElement> | React.RefCallback<HTMLElement>
    ): React.RefCallback<unknown> {
        if (!this._forwardRefResult) {
            const ownChainOfRef = new ChainOfRef();
            ownChainOfRef
                .add(new CreateControlNodeRef(this.inst))
                .add(new CreateControlRef(this.inst));

            this._forwardRefResult = ownChainOfRef.execute();
        }

        const newChainOfRef = new ChainOfRef();
        newChainOfRef.add(new CreateOriginRef(this._forwardRefResult));

        if (propsForwardRef) {
            newChainOfRef.add(new CreateOriginRef(propsForwardRef));
        }

        return newChainOfRef.execute();
    }

    /**
     * Извлекаем из props события, чтобы передать их аргументов в генератор.
     * Нужно передать события react в генератор, чтобы подписки добавленные на wasaby контрол не пропали.
     * @param wasabyOptions Опции wasaby.
     */
    private extractReactEvent(wasabyOptions: IControlOptions): void {
        const reactEvent: Record<string, Function> = {};
        for (const eventName of reactEventList) {
            if (
                wasabyOptions.hasOwnProperty(eventName) &&
                typeof wasabyOptions[eventName] === 'function'
            ) {
                reactEvent[eventName] = wasabyOptions[eventName];
            }
        }
        if (Object.keys(reactEvent).length) {
            wasabyOptions._$attributes.reactEvent = reactEvent;
        }
    }

    private _prepareDataBeforeUpdate(
        newProps: TOptions,
        newState: IControlState
    ): { newOptions: TOptions } {
        const newOptions = this.createWasabyOptions(newProps);
        this._beforeMountDecorator.updateTheme(newOptions.theme);

        return { newOptions };
    }

    private _callBeforeUpdate(options: TOptions, isOptionsChanged: boolean): void {
        if (!this.inst._mounted) {
            this._optionsForBeforeUpdateBeforeMount = this._beforeMountOptions;
            return;
        }
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
        try {
            // необходимо приостановить работу реактивности, чтобы в случае изменения состояния в _beforeUpdate
            // не произошло запуска еще одной перерисовки - перерисовка и так уже запущена
            this.pauseReactive(() => {
                /* здесь происходит такая тасовка _options из-за того,
                    что в момент вызова setState({loading: false}) родителя
                    у него могли поменяться реактивные свойства,
                    что приведет к перерисовке детей и изменению у них _options на новые
                    при том, что у них еще не вызывался _afterMount
                    но потом из-за перерисовки сразу после маунта, вызванной отложенным _forceUpdate,
                    будет вызван _beforeUpdate, но уже на инстансе контрола будут новые _options
                    и сравнение новых options и старых this._options будет ломаться. */
                // eslint-disable-next-line
                // @see https://online.sbis.ru/open_dialog.html?guid=3a6f2745-bcc7-4b81-8c29-732bec444851&user=11f1d1c5-8d45-4bc0-bcd7-9745bf8ddebc
                // @ts-ignore
                const currentOptions = this.inst._options;

                // Если обновление запланировано во время маунта, ожидается, что во время него
                // this._options равно опциям первого рендера. Даже если с точки зрения реакта
                // за время маунта произошло несколько обновлений, для васаби это первое обновление.
                if (typeof this._optionsForBeforeUpdateBeforeMount !== 'undefined') {
                    // @ts-ignore
                    this.inst._options = this._optionsForBeforeUpdateBeforeMount;
                    delete this._optionsForBeforeUpdateBeforeMount;
                }

                // в Wasaby гарантировалось, что если опции не поменялись, они те же по ссылке.
                if (!isOptionsChanged) {
                    /* существует логика, по которой в контроле, с которого пошло обновление,
                        в _beforeUpdate приходят старые опции,
                        а не какие-то новые сгенерированные сверху,
                        значит надо определить, что это корневой контрол перерисовки.
                        если у родителя заполнен _oldOptions,
                        значит он в данный момент тоже обновляется, тогда берем новые опции.
                        Но когда есть _optionsForBeforeUpdateBeforeMount,
                        мы по текущей логике не обновляем this._options.
                        В итоге новые опции не придут в _beforeUpdate,
                        так что пока что в этом сценарии просто обновим всегда. */
                    if (!this._delayedUpdateDuringMount) {
                        // @ts-ignore
                        this.inst._options = options;
                    }
                }
                this._delayedUpdateDuringMount = undefined;
                // TODO: https://online.sbis.ru/opendoc.html?guid=a9962c03-d5ca-432c-bc8b-a244e5a1b1ed
                // @ts-ignore
                this.inst._beforeUpdate(options);

                // потом нужно вернуть "текущие" опции
                // @ts-ignore
                this.inst._options = currentOptions;
            });
        } catch (err) {
            Logger.error(err.message, this.inst, err);
        }
    }

    /**
     * Создаёт и монтирует контрол на элемент
     * @param ctor Конструктор контрола.
     * @param cfg Опции контрола.
     * @param domElement Элемент, на который должен быть смонтирован контрол.
     */
    static createControl<
        P extends IControlOptions,
        T extends HTMLElement & { eventSystem?: IWasabyEventSystem },
    >(
        ctor: IControlConstructor<P>,
        cfg: P & { element?: Element; ref?: React.Ref<unknown> },
        domElement: T,
        needHydrate?: boolean
    ): Control {
        if (domElement) {
            // если пришел jquery, вытащим оттуда элемент. Это нужно для старых страниц
            // eslint-disable-next-line no-param-reassign
            domElement = domElement[0] || domElement;
        }

        const compatible = ClientLogic.configureCompatibility(domElement, cfg, ctor);
        cfg._$createdFromCode = true;
        cfg._$iWantBeWS3 = compatible;

        // кладём в конфиг наследуемые опции, чтобы они попали в полноценные опции
        cfg.theme = cfg.theme ?? 'default';
        cfg.readOnly = cfg.readOnly ?? false;
        WasabyEvents.initInstance(domElement);
        TouchEvents.initInstance(domElement);
        initResizeObserver();
        initIntersectionObserver();
        rootContainers.add(domElement);
        startDOMFocusSystem(domElement);

        let rootComponent;
        if (isForwardRef(ctor) || isComponentClass(ctor)) {
            cfg.ref = ChainOfRef.both(cfg.ref, (v) => {
                rootComponent = v;
            });
        }

        // Реакт монтирует не на сам элемент, а внутри него. Из-за этого едут размеры.
        if (!detection.isIE) {
            domElement.style.height = '100%';
            domElement.style.width = '100%';
            domElement.style.display = 'contents';
        }

        const domElementWithSizes = domElement.parentElement ?? document.body;
        let reactElement;
        if (compatible) {
            // в случае когда страница совместима, контрол создается не из бутстрапа где есть обертка AdaptiveInitializer
            // соответственно нужно сделать обертку здесь
            // todo подумать, может быть оттуда убрать обертку там и всегда делать ее здесь.
            //  https://online.sbis.ru/opendoc.html?guid=0d4b9314-e5ec-4876-a2b3-83505cf6072a&client=3

            reactElement = React.createElement(AdaptiveInitializerConfig, {
                domElementWithSizes,
                children: React.createElement(AdaptiveInitializerInternal, {
                    children: React.createElement(ctor, cfg),
                }),
            });
        } else {
            reactElement = React.createElement(AdaptiveInitializerConfig, {
                domElementWithSizes,
                children: React.createElement(ctor, cfg),
            });
        }

        if (needHydrate) {
            const TEXT_NODE = 3;
            let length;
            // убрать сообщение об ошибке гидрации из-за \n в тексте перед корневым div
            // возможно не самый эффективный способ, но зато универсальный
            // присваивать сразу innerHtml нельзя, 2 раза грузится статика, картинки и тп
            // https://online.sbis.ru/opendoc.html?guid=39f02529-f0c3-4280-8398-146c833056f2&client=3
            length = domElement.childNodes.length;
            if (
                length &&
                domElement.childNodes[0].nodeType === TEXT_NODE &&
                !domElement.childNodes[0].textContent.trim()
            ) {
                domElement.removeChild(domElement.childNodes[0]);
            }
            length = domElement.childNodes.length;
            if (
                length &&
                domElement.childNodes[length - 1].nodeType === TEXT_NODE &&
                !domElement.childNodes[length - 1].textContent.trim()
            ) {
                domElement.removeChild(domElement.childNodes[length - 1]);
            }

            performance?.mark?.('HYDRATE START');
            ReactDOM.hydrate(reactElement, domElement, () => {
                performance?.mark?.('HYDRATE END');
            });
            return;
        }

        performance?.mark?.('RENDER START');
        ReactDOM.render(reactElement, domElement, () => {
            performance?.mark?.('RENDER END');
        });

        if (rootComponent && rootComponent.hasOwnProperty('UNSAFE_isReact')) {
            return rootComponent as unknown as Control;
        }
    }

    // Обратный метод для createControl. Вероятно, стоит выделить создание-разрушение контрола в отдельный класс.
    static destroyControl(
        control: Control<unknown, unknown>,
        element: HTMLElement | [HTMLElement]
    ): void {
        const container: HTMLElement = element.hasOwnProperty('length') ? element[0] : element;
        // Проверяем, что контейнер есть, ещё не удалён из DOM дерева, и что контрол корневой. Иначе ошибка в консоль.
        if (rootContainers.has(container)) {
            rootContainers.delete(container);
            try {
                // Наиболее безопасно в хотфикс. Ошибка нестабильная, сложно поймать.
                // По сценарию https://online.sbis.ru/opendoc.html?guid=0158e2a4-4687-40e6-97d6-816bc8869d21
                // По идее, раз мы сюда попали - нужно вызвать анмаунт. Иначе анмаунт хуки и рефы не вызовутся.
                // Это приведёт к утечке. Так что обязательно нужно найти, кто, как и зачем отсоединяет react корень.
                if (container.parentNode && container.firstChild) {
                    // С текущей системой анмаунта не должно быть проблем, можно не проверять на _destroyed.
                    ReactDOM.unmountComponentAtNode(container);
                }
            } catch {
                Logger.error('Не смогли демонтировать контрол ' + control._moduleName, control);
            }

            // На данный момент только tabDown завязан на элемент. Остальные используют document.
            stopDOMFocusSystem(container, {
                tabDown: true,
                focusEvents: false,
                restoreFocus: false,
            });

            WasabyEvents.destroyInstance(container);
            TouchEvents.destroyInstance(container);
            // при вызове Vdom.Synchronizer.unMountControlFromDOM изолированную область надо разрушить рекурсивно
            // это необходимо чтобы контролы разрушилсь в правильном порядке
            // иначе обработчики из _beforeUnmount будут вызваны в другом порядке,
            // в ряде случае на это поведение заточен прикладной код
            // например, https://online.sbis.ru/opendoc.html?guid=fef03d67-5423-4fec-bf06-bb4f1f21e086
            control._$wasabyUpdater.registerUnmountControl(control);
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
                Logger.error(
                    'Для создания контрола ' +
                        ctor.prototype._moduleName +
                        ' в качестве конфига был передан объект с опциями его родителя ' +
                        parent._moduleName +
                        '. Не нужно передавать чужие опции для создания контрола, потому что они могут ' +
                        'изменяться в процессе создания!',
                    this
                );
            } else {
                cfg.parent = cfg.parent || parent;
            }
            return true;
        } else {
            return !isNewEnvironment();
        }
    }

    static mixCompatible<TOptions extends TWasabyOverReactProps, TState>(
        ctor: Control<TOptions, TState>,
        cfg: TOptions
    ): void {
        if (typeof window === 'undefined') {
            return;
        }
        if (requirejs.defined('Core/helpers/Hcontrol/makeInstanceCompatible')) {
            const makeInstanceCompatible = requirejs(
                'Core/helpers/Hcontrol/makeInstanceCompatible'
            );
            makeInstanceCompatible(ctor, cfg);
            unmountJQueryPatcher.patchJQuery();
            // совместимость заполняет this._options, но на этой стадии его опции еще должны быть не заполнены.
            // поэтому после подмешивания совместимости очистим this._options,
            // т.к. всё равно далее в render будет полное переприсвоение опций
            // @ts-ignore
            ctor._options = {} as TOptions;
        } else {
            Logger.warn(`Попытка подмешать совместимость контролу, но makeInstanceCompatible не был подгружен.
            Компонент - ${ctor._moduleName}`);
        }
    }
}
