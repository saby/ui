/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { Component, PureComponent } from 'react';
import * as React from 'react';

import { IFocusConfig } from 'UICommon/Focus';
import template = require('wml!UICore/_base/Control/Control');
import { IControlState, TWasabyOverReactProps } from './interfaces';
import { IWasabyEventSystem } from 'UICommon/Events';
import { TIState, TControlConfig } from 'UICommon/interfaces';
import { IControlOptions, TemplateFunction } from 'UICommon/Base';
import IWasabyControl from './Control/IWasabyControl';
import ClientLogic from './Control/ClientLogic';
import ServerLogic from './Control/ServerLogic';
import BaseLogic, { TWasabyContext } from './Control/BaseLogic';
import { isUnitTestMode } from 'UICommon/Utils';
import { isDebug } from 'UICommon/Utils';
import { checkReactApiRedefined } from './Control/checkApiRedefined';
import { Logger } from 'UICommon/Utils';
import { hackPromise } from './Control/hackPromise';
import ThemeController from './Control/ThemeController';

export type IControlConstructor<P = IControlOptions> = React.ComponentType<P>;
type TChildElement =
    | Element
    | Control
    | Control<IControlOptions, TIState>
    | Component
    | PureComponent;
export type IControlChildren = Record<string, TChildElement>;

import cExtend = require('Core/core-extend');
import ChildrenRefsCreator from './Control/ChildrenRefsCreator';
import WasabyUpdater from './Control/WasabyUpdater';
import AfterMountDecorator from './Control/AfterMountDecorator';
import { getWasabyContext } from 'UICore/Contexts';

let countInst = 1;

const Logic: typeof BaseLogic =
    typeof window === 'undefined' ? ServerLogic : ClientLogic;

/**
 * Базовый контрол, от которого могут наследоваться интерфейсные контролы фреймворка Wasaby (если они написаны не на чистом React).
 * Наследник React.Component с поддержкой совместимости с Wasaby.
 * Подробнее о работе с классом читайте <a href="/doc/platform/developmentapl/interface-development/ui-library/control/">здесь</a>.
 * @implements UICore/_base/IWasabyControl
 * @remark <a href="/doc/platform/developmentapl/interface-development/ui-library/asynchronous-control-building/">Asynchronous creation of UI/Base:AsyncCreator component</a>
 * @public
 */
export default class Control<
        TOptions extends TWasabyOverReactProps = {},
        TState extends TIState = void
    >
    extends Component<TOptions, IControlState>
    implements IWasabyControl
{
    readonly _instId: string = 'inst_' + countInst++;
    protected _container: HTMLElement = null;
    /**
     * Набор детей контрола, для которых задан атрибут name.
     */
    protected _children: IControlChildren;
    /**
     * Шаблон контрола.
     */
    protected _template: TemplateFunction;
    /**
     * Реальные опции контрола. Туда собираются значения из props.
     * ВАЖНО: значения могут не совпадать с props в некоторые моменты времени,
     * чтобы в хуках были правильные значения.
     */
    protected _options: TOptions = {} as TOptions;
    protected _theme: string[];
    protected _styles: string[];

    /**
     * Список зарегистрированных обработчиков для _notify
     */
    _$needRemoveBeforeUnmount: Function[] = [];
    _$notifyEvents = new Map();
    // на этот флаг заточена часть поведения платформенных и прикладных контролов
    // TODO: удалить по задаче https://online.sbis.ru/opendoc.html?guid=fac81b21-02fa-40ea-8be3-071a7eeb74c6
    _destroyed: boolean;
    /**
     * Используется для того, чтобы не вызывать хуки ЖЦ до реального построения контрола.
     * Флаг используется снаружи, вынуждены использовать старое имя. Теперь так просто не удалить.
     * @private
     */
    _mounted: boolean;
    _unmounted: boolean;
    /**
     * подмешивается в совместимости. нужно для совместимости с ws3.
     * Определяет значения опций для декорирования.
     */
    _decOptions: { class?: string };
    /**
     * Название контрола.
     */
    _moduleName: string;

    /**
     * функция обратного вызова для ResizeObserver'a
     * при наличии всинхронных детей внутри контейнра за которым мы следим
     * надо вызывать колбэк функцию только после рендера детей
     * @private
     */
    _$observerCallback: () => void; // todo нужно только в ResizeObserver
    _$wasabyUpdater: WasabyUpdater; // todo должен ругаться на сервере. берется в Logic
    childrenRefsCreator: ChildrenRefsCreator; // todo нужно только в генераторах
    _$afterMountDecorator: AfterMountDecorator; // todo нужно только в WasabyEvents
    /**
     * Опции, который были до рендера контрола, передаются как параметр в хуки
     * жизненного цикла _afterRender и _afterUpdate
     */
    _oldOptions: TOptions; // todo нужно только в Logic, когда берем их из родителя чтобы определить корень перерисовки
    /**
     * Логический родитель. То есть тот, в шаблоне которого лежит данный экземпляр.
     * В идеале отказаться, но пока что есть использования.
     */
    // @ts-ignore
    _logicParent: Control<IControlOptions, void>; // todo нужно в совместимости (BaseCompatible) и в юнитах

    /**
     * Нужно для переноса _children родителя из оберток над чистым реактом, чтобы работал вызов методов с инстанса контрола
     */
    _transferChildrenToParent?: boolean;

    _$adaptiveStyles?: Partial<CSSStyleDeclaration>;

    // todo for unit only
    get _optionsVersions() {
        // @ts-ignore
        return this.logic._optionsVersions;
    }

    private logic: BaseLogic<TOptions, TState>;

    // TODO: TControlConfig добавлен для совместимости, в 3000 нужно сделать TOptions и здесь.
    constructor(
        props: TOptions | TControlConfig = {},
        context?: TWasabyContext
    ) {
        super(props as TOptions);

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es 2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this.initControl(props, context);
    }

    protected initControl(props: TOptions | TControlConfig = {}, context?: TWasabyContext) {
        this.logic = new Logic<TOptions, TState>(this, context);

        this.state = {
            loading: true,
        };
        const constructor = this.constructor as React.ComponentType;
        // Записываем в статическое поле компонента имя для удобной работы через React DevTools
        if (!constructor.displayName) {
            constructor.displayName = this._moduleName;
        }

        // todo в IE не работает хак, потому что не работает instanceof, setPrototypeOf не помогает,
        // там проблема с "deferred instanceof Prototype", его тип не соответствует хакнутому даже с заданным прототипом
        if (Symbol?.hasInstance) {
            hackPromise();
        }
    };

    protected _notify(
        eventName: string,
        args?: unknown[],
        options?: { bubbling?: boolean }
    ): unknown {
        return this.logic._notify(this, eventName, args, options);
    }

    activate(cfg: IFocusConfig = {}): boolean {
        return this.logic.activate(cfg);
    }

    // todo нужно для совместимости (makeInstanceCompatible)
    _blur(): void {
        this.logic._blur();
    }
    // FIXME несогласованное API, но используется в engine, и пока нужно для сборки UIReact
    deactivate(): void {
        this.logic._blur();
    }

    // Пока что просто для сохрания API в ts. Возможно, нужна будет реализация. Метод используется в роутинге.
    getInstanceId(): string {
        return this._instId;
    }

    _getEnvironment(): object {
        // в данном методе надо или возвращать объект похожий на environment или ничего
        // пустой объект ломает совместимость с ws3
        // в качестве относительно честной реализации можно использовать BaseCompatible:findFakeEnvironment()
        return undefined;
    }

    /**
     * Запускает обновление.
     * Вызывать его не рекомендуется, обновление контрола должно запускаться изменением реактивных свойств.
     * @private
     */
    _forceUpdate(changedFieldName: string = '_forceUpdate()'): void {
        this.logic.planUpdate(changedFieldName);
    }

    /**
     * Хук жизненного цикла контрола. Вызывается непосредственно перед установкой контрола в DOM-окружение.
     * @virtual
     * @param {Object} options Опции контрола.
     * @param {Object} contexts Поля контекста, запрошенные контролом.
     * @param {Object} receivedState Данные, полученные посредством серверного рендеринга.
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

    /**
     * Хук жизненного цикла контрола. Вызывается сразу после установки контрола в DOM-окружение.
     * @param options Опции контрола.
     * @remark
     * Первый хук жизненного цикла контрола, который вызывается после подключения контрола к DOM-окружению.
     * На этом этапе вы можете получить доступ к параметрам и контексту this._options.
     * Этот хук жизненного цикла часто используется для доступа к DOM-элементам и подписки на события сервера.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _afterMount(options?: TOptions): void {
        // Do
    }

    /**
     * Синхронный хук жизненного цикла контрола. Вызывается сразу после установки контрола в DOM-окружение.
     * @param {Object} options Опции контрола.
     * @remark
     * Первый хук жизненного цикла контрола, который вызывается после подключения контрола к DOM-окружению.
     * На этом этапе вы можете получить доступ к параметрам и контексту this._options.
     * Этот хук жизненного цикла часто используется для доступа к DOM-элементам и подписки на события сервера.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _componentDidMount(options?: TOptions): void {
        // Do
    }

    /**
     * Определяет, должен ли контрол обновляться. Вызывается каждый раз перед обновлением контрола.
     *
     * @param options Опции контрола.
     * @returns {Boolean}
     * * true (значание по умолчанию): контрол будет обновлен.
     * * false: контрол не будет обновлен.
     * @remark
     * Хук жизненного цикла контрола вызывается после хука _beforeUpdate перед перестроением шаблона. Этот хук можно использовать для оптимизаций.
     * Вы можете сравнить новые и текущие параметры и вернуть false, если нет необходимости пересчитывать DOM-дерево контрола.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _shouldUpdate(options: TOptions): boolean {
        return true;
    }

    /**
     * Хук жизненного цикла контрола. Вызывается перед обновлением контрола.
     * @virtual
     * @deprecated
     */
    protected _beforeRender(): void {
        // Do
    }

    /**
     * Хук жизненного цикла контрола. Вызывается перед обновлением контрола.
     *
     * @param newOptions Опции, полученные контролом. Устаревшие опции можно найти в this._options.
     * @virtual
     * @remark В этом хуке вы можете сравнить новые и старые опции и обновить состояние контрола.
     * В этом хуке, также, вы можете подготовить все необходимое для визуализации шаблона контрола. Часто код в этом блоке схож с кодом в хуке _beforeMount.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _beforeUpdate(newOptions?: TOptions): void {
        // Do
    }

    /**
     * Асинхронный хук жизненного цикла контрола. Вызывается после обновления контрола.
     *
     * @param {Object} oldOptions Опции контрола до обновления.
     * Текущие опции можно найти в this._options.
     * @virtual
     * @remark Этот хук жизненного цикла вызывается после обновления DOM-контрола.
     * На этом этапе вы получаете доступ к дочерним контролам и взаимодействуете с DOM-окружением.
     * Часто код в этом хуке схож с кодом в хуке _afterMount.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _afterUpdate(oldOptions?: TOptions): void {
        // Do
    }

    /**
     * Хук жизненного цикла контрола.
     * Вызывается синхронно после того, как изменения были применены к DOM и до того, как браузер отрисовал кадр.
     *
     * @param {Object} oldOptions Опции контрола до обновления.
     * Текущие опции можно найти в this._options.
     * @virtual
     * @remark Служит для манипуляций с DOM перед тем, как пользователь увидит кадр. Например, для корректирования положения скролла.
     * Использование данного хука обычно приводит к проблемам с производительностью, например, к forced reflow.
     * Поэтому для большинства операций предпочтительнее использовать _afterUpdate(), чтобы не откладывать отрисовку
     * кадра.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _afterRender(oldOptions?: TOptions): void {
        // Do
    }

    /**
     * Не использовать в прикладном коде
     * @private
     * @virtual
     */
    protected _componentDidUpdate(oldOptions?: TOptions): void {
        // Do
    }

    /**
     * Хук жизненного цикла контрола. Вызывается до удаления контрола.
     * @virtual
     * @remark Это последний хук жизненного цикла контрола. Контрол не будет существовать после вызова этого хука.
     * Его можно использовать для отмены подписки на события сервера и очистки всего, что было сохранено в памяти.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases
     */
    protected _beforeUnmount(): void {
        // Do
    }

    /**
     * Не использовать в прикладном коде
     * @private
     * @virtual
     */
    protected _$react_componentDidMount(oldOptions?: TOptions): void {
        // Do
    }

    /**
     * Не использовать в прикладном коде
     * @private
     * @virtual
     */
    protected _$react_componentDidUpdate(oldOptions?: TOptions): void {
        // Do
    }

    /**
     * Не использовать в прикладном коде
     * @private
     * @virtual
     */
    protected _$react_componentWillUnmount(): void {
        // Do
    }

    componentDidMount(): void {
        this.logic.componentDidMount(() => {
            return checkApiRedefined(this);
        });
    }

    shouldComponentUpdate(
        newProps: TOptions,
        newState: IControlState
    ): boolean {
        return this.logic.shouldComponentUpdate(
            Control.prototype._shouldUpdate,
            newProps,
            newState
        );
    }

    componentDidUpdate(): void {
        this.logic.componentDidUpdate(() => {
            return checkApiRedefined(this);
        });
    }

    componentWillUnmount(): void {
        this.logic.componentWillUnmount();
    }

    render(isCompatibleControl: boolean = false): React.ReactNode {
        return this.logic.render(isCompatibleControl, () => {
            return checkApiRedefined(this);
        });
    }

    /**
     * Для обратной совместимости
     * @deprecated
     */
    mountToDom(element: HTMLElement, cfg: TOptions): void {
        this.logic.mountToDom(element, cfg);
    }
    /**
     * Для обратной совместимости
     * @deprecated
     */
    saveOptions(options: TOptions, controlNode: any = null): boolean {
        return this.logic.saveOptions(options, controlNode);
    }

    destroy(): void {
        this.logic.destroy();
    }

    // специальный флаг чтобы понимать что у нас базовый контрол наследник react
    // нужно для некоторых мест в контролах, чтобы не городить костыли на костыли
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-match
    protected readonly UNSAFE_isReact: boolean = true;
    // специальный флаг чтобы в unit-тесте по Markup декоратору отключить некоторые тесты в jsonToHtml>escape
    // https://github.com/saby/wasaby-controls/blob/rc-21.6000/tests/ControlsUnit/Decorator/Markup.test.js#L236
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-match
    static readonly UNSAFE_isReact: boolean = true;

    static readonly isWasaby: boolean = true;

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
     * @param {String} themeName имя темы (по-умолчанию тема приложения)
     * @param {Array<String>} themes массив доп тем для скачивания
     * @param {Array<String>} styles массив доп стилей для скачивания
     * @returns {Promise<void>}
     * @static
     * @public
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
        return new ThemeController({
            moduleName: '',
            themeName,
            notLoadThemes: true,
            themes,
            styles,
            instThemes: this._theme,
            instStyles: this._styles,
        }).updateTheme();
    }

    static mixCompatible<TOptions extends TWasabyOverReactProps, TState>(
        ctor: Control<TOptions, TState>,
        cfg: TOptions
    ): void {
        BaseLogic.mixCompatible(ctor, cfg);
    }

    /**
     * Создаёт и монтирует контрол на элемент
     * @param ctor Конструктор контрола.
     * @param cfg Опции контрола.
     * @param domElement Элемент, на который должен быть смонтирован контрол.
     */
    static createControl<
        P extends IControlOptions,
        T extends HTMLElement & { eventSystem?: IWasabyEventSystem }
    >(
        ctor: IControlConstructor<P>,
        cfg: P & { element?: Element },
        domElement: T,
        needHydrate?: boolean
    ): Control {
        return Logic.createControl(ctor, cfg, domElement, needHydrate);
    }

    // Обратный метод для createControl. Вероятно, стоит выделить создание-разрушение контрола в отдельный класс.
    static destroyControl(
        control: Control<unknown, unknown>,
        element: HTMLElement | [HTMLElement]
    ): void {
        Logic.destroyControl(control, element);
    }

    static configureCompatibility(
        domElement: HTMLElement,
        cfg: any,
        ctor: any
    ): boolean {
        return Logic.configureCompatibility(domElement, cfg, ctor);
    }

    /**
     * Старый способ наследоваться
     * @param mixinsList массив миксинов либо расширяющий класс (если один аргумент)
     * @param hackClass расширяюший класс
     */
    static extend(
        mixinsList: object | object[],
        hackClass?: Function
    ): Control {
        return cExtend(this, mixinsList, hackClass);
    }

    static es5Constructor(props: any = {}, context?: any) {
        Component.call(this, props, context);

        // TypesScript в компиляции вставляет в конструктор присвоение значений по умолчанию для полей.
        // Придётся прописать инцилизацию в ручную в нашем самопальном конструкторе.
        //@ts-ignore
        this._$needRemoveBeforeUnmount = [];
        //@ts-ignore
        this._options = {} as TOptions;
        //@ts-ignore
        this._instId = 'inst_' + countInst++;
        //@ts-ignore
        this._container = null;
        //@ts-ignore
        this.UNSAFE_isReact = true;
        //@ts-ignore
        this._$notifyEvents = new Map();

        Control.prototype.initControl.call(this, props, context);
    }

    static getDerivedStateFromError(error: unknown): {
        hasError: boolean;
        error: unknown;
    } {
        return BaseLogic.getDerivedStateFromError(error);
    }
}

/*
FIXME: если я правильно понимаю, это сделано для того, чтобы _template
инициализировался не в конструкторе, а всего один раз. Но ведь того же самого
можно было добиться через статическое поле.
 */
Object.assign(Control.prototype, {
    _template: template,
});
// нужно для совместимости, чтобы перебить _notify совместимым, который будет учитывать EventBus
((Control.prototype as any)._notify as any)._isVdomNotify = true;

function checkApiRedefined<TOptions, TState>(
    control: Control<TOptions, TState>
): void {
    if (isUnitTestMode() || !isDebug()) {
        return;
    }
    const redefinedApi = checkReactApiRedefined<TOptions, TState>(control, Control);
    if (redefinedApi.length) {
        const err = new Error(
            'Контрол ' +
                control._moduleName +
                ' переопределил api реакта ' +
                redefinedApi +
                '.' +
                ' Необходимо переименовать эти места, чтобы не нарушить работу реакта.'
        );
        if (redefinedApi[0] === 'contextType') {
            // todo временно скипаем предупреждения для FED пока они не решат проблему, у них падает слишком много
            //  https://online.sbis.ru/opendoc.html?guid=e8363480-ff03-47e3-bcde-b3c3bd1d0175&client=3
            if (control._moduleName.indexOf('FED2') === -1) {
                Logger.warn('Проблема в ' + control._moduleName + '! ' +
                    'Если контрол наследуется от UI/Base:Control, ' +
                    'у него не должно быть поля static contextType, иначе он перебьет базовый контекст, ' +
                    'настроенный в UI/Base:Control, и таким образом в контрол не будут переданы пропы из контекста' +
                    '(readOnly, theme, Router, adaptiveMode, refForContainer и тп).' +
                    'Это может послужить причиной ошибки сейчас или в будущем.');
            }
        } else {
            Logger.error(err.message, undefined, err);
        }
    }
}
