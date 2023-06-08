import * as React from 'react';
import { wasabyAttrsToReactDom } from './Attributes';
import { Logger, isUnitTestMode } from 'UICommon/Utils';
import {
    CommonUtils as Common,
    IGenerator,
    Attr,
    ConfigResolver,
    Scope,
    plainMerge,
    Helper,
    IGeneratorNameObject,
    ITplFunction,
    IGeneratorConfig,
} from 'UICommon/Executor';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { TWasabyEvent, TTemplateEventObject } from 'UICore/Events';

import { TemplateFunction, IControlOptions } from 'UICommon/Base';
import type { TIState } from 'UICommon/interfaces';
import type {
    IGeneratorAttrs,
    TemplateOrigin,
    IControlConfig,
    TemplateResult,
    AttrToDecorate,
} from './interfaces';
import { Control } from 'UICore/Base';
import ReactElementIntoTemplate, {
    isReactElement,
    isComponentClass,
    isMemizedOrForwardFunctionComponent,
} from 'UICore/_executor/_Markup/Creator/ReactComponent';
import { createElementForTemplate } from './Creator/TemplateCreator';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { CreateAttrsRef } from './Refs/CreateAttrsRef';
import { flattenObject } from './Utils';
import { processMergeAttributes } from '../_Utils/Attr';
import { addDataQaEventAttributes } from './EventsToDataQa';

/**
 * TODO убрать когда избавимся от функционального подхода в генераторах
 */
const reactCreator = new ReactElementIntoTemplate();

const isServerSide = typeof window === 'undefined';

export class Generator implements IGenerator {
    private reactCreator: ReactElementIntoTemplate = reactCreator;

    constructor(readonly config: IGeneratorConfig = {}) {
        // для совместимого генератора
    }
    /**
     * В старых генераторах в этой функции была общая логика, как я понимаю.
     * Сейчас общей логики нет, поэтому функция по сути не нужна.
     * Судя по типам, все методы, которые могли вызваться из этой функции - публичные,
     * т.е. либо та логика дублировалась где-то ещё, либо типы были описаны неправильно.
     * @param type Тип элемента, определяет каким методом генератор будет его строить.
     * @param origin Либо сам шаблон/конструктор контрола, либо строка, по которой его можно получить.
     * @param attributes Опции, заданные через attr:<имя_опции>.
     * @param events
     * @param options Опции контрола/шаблона.
     * @param config
     */
    // @ts-ignore
    createControlNew<R = JSX.Element | string>(
        type: 'wsControl' | 'template',
        origin:
            | React.ComponentClass
            | React.Component
            | React.ReactElement
            | React.FunctionComponent
            | TemplateOrigin,
        attributes: Attr.IAttributes,
        events: TTemplateEventObject,
        options: IControlOptions,
        config: IControlConfig
    ): R {
        const baseName = attributes.name;
        let decorAttribs = !config.compositeAttributes
            ? wasabyAttrsToReactDom(attributes, false)
            : processMergeAttributes(
                  wasabyAttrsToReactDom(config.compositeAttributes, false),
                  wasabyAttrsToReactDom(attributes, false)
              );
        decorAttribs =
            !config.attr || config.mergeType !== 'attribute'
                ? decorAttribs
                : processMergeAttributes(
                      wasabyAttrsToReactDom(config.attr.attributes, false),
                      decorAttribs
                  );

        addDataQaEventAttributes(decorAttribs, events, config);

        let fullEvents = {};
        if (!isServerSide) {
            if (config?.attr?.events && config.mergeType === 'attribute') {
                fullEvents = Attr.mergeEvents(config.attr.events, events);
            } else {
                fullEvents = events;
            }
        }

        let resolvedOptions = options;
        if (typeof resolvedOptions === 'function') {
            // вместо опций может прилететь функция, выполнение которой отдаст опции,
            // calculateScope вычисляет такие опции
            resolvedOptions = Scope.calculateScope(resolvedOptions, plainMerge);
            config.unitedScope = true;
        }
        // если контрол создается внутри контентной опции, нужно пробросить в опции еще те, что доступны в контентной
        // опции.
        const resolvedOptionsExtended = ConfigResolver.addContentOptionScope(
            resolvedOptions,
            config
        );
        /*
        У шаблонов имя раньше бралось только из атрибута.
        У контролов оно бралось только из опций.
        Вряд ли есть места, где люди завязались на это поведение.
        Поэтому чтобы не костылять с проверками, просто поддержу и опции, и атрибуты для всего.
         */
        const name = (baseName as string) ?? resolvedOptionsExtended.name;

        const originRef = resolvedOptions.ref;

        const newOptions = this.calculateOptions(
            resolvedOptionsExtended,
            config,
            fullEvents,
            name,
            originRef
        );
        if (!newOptions._$attributes) {
            newOptions._$attributes = {
                attributes: {},
            };
        }
        const physicParent = newOptions._physicParent;
        const logicParent = newOptions._logicParent;
        // @ts-ignore FIXME: Нужно положить ключ в опцию rskey для Received state. Сделать это хорошо
        newOptions.rskey = decorAttribs.key || config.key;
        // сохраняем ОПЦИЮ key, если этого не сделать, то реакт удалит ее из props
        // key в качестве опции используется как часть API FormController'a и в некоторых других местах
        newOptions._$key = newOptions.key;
        // сохраняем АТТРИБУТ key, чтобы восстановить его на DOM-элементе
        // селектор вида element.attributes.key используется в проверках (смоки)
        newOptions._$attrKey = decorAttribs.key;

        type TtplType =
            | typeof Control
            | TemplateFunction
            | React.ReactElement
            | React.FunctionComponent
            | Function
            | ITplFunction<TemplateFunction>
            | Common.ITemplateArray;
        const tplExtended: TtplType | Common.IDefaultExport<TtplType> =
            resolveTpl(origin, config.includedTemplates, config.depsLocal);
        let tpl: TtplType;

        if (Common.isDefaultExport(tplExtended)) {
            // @ts-ignore
            tpl = tplExtended.default;
        } else {
            // @ts-ignore
            tpl = tplExtended;
        }

        if (tpl?.isChildrenAsContent) {
            // либо в опциях уже есть children если его передали в partial с контентом,
            // либо тогда надо вычислить - взять из скоупа
            // в зависимости от того какой шаблон строится - скоуп будет либо контрол либо объект с опциями
            newOptions.children =
                newOptions.children ||
                config.data.children ||
                config.data.props?.children;
            if (!newOptions.children) {
                Logger.error(
                    'При построении контентной опции ' +
                        'wasaby вставленной в чистом реакте должен найтись children',
                    logicParent
                );
            }
        }

        if (Common.isControlClass<typeof Control>(tpl)) {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            return this.processControl(
                createWsControl(tpl, newOptions, templateAttributes, config)
            );
        }

        // для контентных опций под vdom/generator для поддержки вставки wasaby-контролов напрямую через
        // треугольные скобки пришлось видоизменить хранение контентной опции, чтобы она была функцией, а у нее
        // хранится свойство array с контентной опцией.
        // todo зачем эта отдельная обработка, если в tpl лежит функциональный компонент который просто надо позвать,
        //  мы тут это делаем чуть ниже проверкой на функцию. только мешается выставление isDataArray, если бы
        //  его не было, мы бы попали в правильную обработку функционального компонента.
        if (tpl && tpl.isDataArray && tpl.array) {
            return resolveTemplateArray.call(
                this,
                logicParent,
                physicParent,
                tpl.array,
                newOptions,
                decorAttribs,
                fullEvents,
                this.config,
                config
            );
        }
        // Common.ITemplateArray - массив шаблонов, может например прилететь,
        // если в контентной опции несколько корневых нод
        if (Common.isArray(tpl)) {
            return resolveTemplateArray.call(
                this,
                logicParent,
                physicParent,
                tpl,
                newOptions,
                decorAttribs,
                fullEvents,
                this.config,
                config
            );
        }
        // TemplateFunction - wml шаблон
        if (Common.isTemplateClass(tpl)) {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            return createTemplate.call(
                this,
                tpl,
                newOptions,
                templateAttributes,
                config,
                logicParent,
                physicParent
            );
        }
        // content option - в определенном способе использования контентная опция может представлять собой объект
        // со свойством func, в котором и лежит функция контентной опции.
        // Демка ReactUnitTest/MarkupSpecification/resolver/Top
        if (Common.isTplFunction(tpl)) {
            const internal = tpl.internal;
            tpl = tpl.func;
            tpl.internal = internal;
        }

        // typecast временно
        if (isReactElement(tpl as React.ReactElement)) {
            return tpl as React.ReactElement;
        }

        if (isComponentClass(tpl)) {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            return this.reactCreator.createComponent(
                tpl,
                newOptions,
                templateAttributes,
                !!config.isVdom
            );
        }

        // tmpl шаблон (closured), или контентная опция
        if (Common.isTemplateFunction(tpl)) {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            return resolveTemplateFunction.call(
                this,
                logicParent,
                physicParent,
                tpl,
                newOptions,
                templateAttributes,
                templateAttributes.context,
                config
            );
        }
        // инлайн шаблоны
        if (
            typeof origin === 'string' &&
            (config.depsLocal[origin] || config.includedTemplates[origin])
        ) {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            return resolveTemplateFunction.call(
                this,
                logicParent,
                physicParent,
                tpl,
                newOptions,
                templateAttributes,
                templateAttributes.context,
                config
            );
        }

        // функциональные компоненты на чистом реакте
        if (tpl && typeof tpl === 'function') {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            convertForwardedRefToRef(newOptions);
            return this.reactCreator.createFnComponent(
                tpl as React.ComponentClass,
                newOptions,
                templateAttributes,
                !!config.isVdom
            );
        }
        // функциональные компоненты на чистом реакте (обернутые в memo или forwardRef)
        if (isMemizedOrForwardFunctionComponent(tpl)) {
            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                this.config
            );
            convertForwardedRefToRef(newOptions);
            return this.reactCreator.createFnComponent(
                tpl as React.ComponentClass,
                newOptions,
                templateAttributes,
                !!config.isVdom
            );
        }

        // Здесь может быть незарезолвленный контрол optional!. Поэтому результат должен быть пустым
        if (Common.isOptionalString<TemplateOrigin>(origin)) {
            return null;
        }
        // здесь обрабатывается просто строка, которую передали в partial - она должна вставиться как строка
        if (typeof origin === 'string') {
            return '' + origin;
        }
        // На СП локализованная строка будет объектом типа String или TemplatableString (наследник String)
        if (origin instanceof String) {
            return origin.toString();
        }
        // игнорируем выводимое значение null для совместимости с реализацией wasaby
        if (origin === null) {
            return null;
        }

        // не смогли зарезолвить - нужно вывести ошибку
        logResolverError(origin, logicParent);
        return '' + origin;
    }

    protected createWsControl(
        tpl: typeof Control,
        newOptions: IControlOptions,
        templateAttributes: IGeneratorAttrs,
        config: IControlConfig
    ):
        | string
        | React.ComponentElement<
              IControlOptions,
              Control<IControlOptions, object>
          > {
        return this.processControl(
            createWsControl(tpl, newOptions, templateAttributes, config)
        );
    }

    // TODO: перенести в View/_executorCompatible/_Markup/Compatible/GeneratorCompatibleReact
    protected createTemplateNew(
        tpl: TemplateFunction,
        newOptions: IControlOptions,
        templateAttributes: IGeneratorAttrs,
        config: IControlConfig,
        parent: Control<IControlOptions>,
        logicParent: Control<IControlOptions>
    ): TemplateResult {
        return createTemplate(
            tpl,
            newOptions,
            templateAttributes,
            config,
            parent,
            logicParent
        );
    }

    protected abstract calculateOptions(
        resolvedOptionsExtended: IControlOptions,
        config: IControlConfig,
        events: Record<string, unknown>,
        name: string,
        originRef: React.MutableRefObject<Control> | React.LegacyRef<Control>
    ): IControlOptions;

    /**
     * Дает возможность дополнительно трансформировать результат построения контрола.
     * @param control Результат построения контрола.
     */
    protected abstract processControl(
        control: React.ComponentElement<
            IControlOptions,
            Control<IControlOptions, object>
        >
    ):
        | string
        | React.ComponentElement<
              IControlOptions,
              Control<IControlOptions, object>
          >;

    abstract createText(text: string): string;

    abstract createDirective(text: string): string;

    /*
    FIXME: Изначально в joinElements было return ArrayUtils.flatten(elements, true).
    Он зовётся из каждого шаблона, так что нельзя просто взять и удалить.
    Вроде он нужен для тех случаев, когда partial вернёт вложенный массив. Я пытался возвращать
    несколько корневых нод из partial, возвращался просто массив из двух элементов.
    Так что пока этот метод ничего не делает.
     */
    abstract joinElements(
        elements: string[] | React.ReactNode
    ): string | React.ReactNode;

    /**
     * Строит DOM-элемент.
     * @param tagName Название DOM-элемента.
     * @param attrs Атрибуты DOM-элемента.
     * @param children Дети DOM-элемента.
     * @param attrToDecorate атрибуты элемента.
     * @param __
     * @param control Инстанс контрола-родителя, используется для заполнения _children.
     */
    abstract createTag<
        T extends HTMLElement,
        P extends React.HTMLAttributes<T>
    >(
        tagName: keyof React.ReactHTML,
        attrs: {
            attributes: P;
            events: Record<string, TWasabyEvent[]>;
        },
        children: React.ReactNode[],
        attrToDecorate: AttrToDecorate,
        __: unknown,
        control?: Control
    ): string | React.DetailedReactHTMLElement<P, T>;

    abstract escape<T>(value: T): T;

    /**
     * подготавливает опции для контрола. вызывается в функции шаблона в случае выполнения инлайн шаблона
     * @param tplOrigin тип шаблона
     * @param scope результирующий контекст выполнения
     */
    abstract prepareDataForCreate(
        tplOrigin: TemplateOrigin,
        scope: IControlOptions,
        attrs: IGeneratorAttrs
    ): IControlOptions;
}

/**
 * Только для функциональных контролов, чтобы корректно перенаправить ref.
 * Патчит опции контрола так, что превращает forwardedRef в ref если ref ещё нет в опциях.
 * В опциях будет forwardedRef, если в tsx строится контентная опция с функциональным контролом внутри
 * - forwardedRef будет прокинут из ElementCreator.
 * Если одновременно есть и ref и forwardedRef для функционального контрола, то это ошибка
 * - значит кто-то вместе с ref намеренно руками передал forwardedRef.
 */
function convertForwardedRefToRef(props: IControlOptions): void {
    if (!props.forwardedRef) {
        return;
    }

    if (!props.ref) {
        props.ref = props.forwardedRef;
        delete props.forwardedRef;
    }
}

function createTemplateAttributes(
    decorAttribs: Attr.IAttributes,
    fullEvents: Record<string, TWasabyEvent[]>,
    config: IControlConfig,
    generatorConfig: IGeneratorConfig
): IGeneratorAttrs {
    const templateAttributes: IGeneratorAttrs = {
        attributes: decorAttribs,
        events: fullEvents,
        _$parentTemplateId: config.attr?._$templateId,
        key: Helper.calculateKey(decorAttribs, config),
        context: config.attr ? config.attr.context : {},
    };

    if (!isServerSide) {
        // если partial в корне инлайн шаблона
        if (config.attr?.isContainerNodeInline) {
            if (config.isRootTag) {
                templateAttributes._isRootElement = true;
                if (config.attr?.refForContainer) {
                    templateAttributes.refForContainer =
                        config.attr.refForContainer;
                }
            }
        } else if (config.isContainerNode) {
            // внутри шаблона (или построили контрол, но тогда флаг сбросится в render контрола)
            templateAttributes._isRootElement = true;
            if (config.attr?.refForContainer) {
                templateAttributes.refForContainer =
                    config.attr.refForContainer;
            }
        } else if (config.attr?._isRootElement) {
            // если есть pName значит partial в контентной опции
            if (config.pName) {
                if (config.isRootTag) {
                    templateAttributes._isRootElement = true;
                    if (config.attr?.refForContainer) {
                        templateAttributes.refForContainer =
                            config.attr.refForContainer;
                    }
                }
            } else if (config.attr?.isInline) {
                if (config.isRootTag) {
                    // внутри шаблона (или построили контрол, но тогда флаг сбросится в render контрола)
                    templateAttributes._isRootElement = true;
                    if (config.attr?.refForContainer) {
                        templateAttributes.refForContainer =
                            config.attr.refForContainer;
                    }
                }
            } else if (config.hasOwnProperty('mergeType')) {
                if (config.mergeType !== 'none') {
                    // для шаблонов хранимых в файлах
                    // если mergeType none значит атрибуты и контексты не мержатся, значит в шаблоне partial не в корне
                    // и в него не надо прокидывать refForContainer,
                    // в шаблоне уже есть корень для которого будет применен ref
                    templateAttributes._isRootElement = true;
                    if (config.attr?.refForContainer) {
                        templateAttributes.refForContainer =
                            config.attr.refForContainer;
                    }
                }
            } else {
                // внутри шаблона (или построили контрол, но тогда флаг сбросится в render контрола)
                templateAttributes._isRootElement = true;
                if (config.attr?.refForContainer) {
                    templateAttributes.refForContainer =
                        config.attr.refForContainer;
                }
            }
        }
    }

    if (generatorConfig && generatorConfig.prepareAttrsForPartial) {
        generatorConfig.prepareAttrsForPartial(templateAttributes);
    }

    if (generatorConfig && generatorConfig.isReactWrapper) {
        templateAttributes.isReactWrapper = true;
    }

    return templateAttributes;
}

function getLibraryTpl(
    tpl: IGeneratorNameObject,
    deps: Common.Deps<typeof Control>
): typeof Control | Common.ITemplateArray {
    const getPath = (tplObject: IGeneratorNameObject) => {
        const path = tplObject.library + ':';
        if (tplObject.module.length === 1) {
            return path + tplObject.module;
        }
        return (path + tplObject.module).replace(/,/g, '.');
    };
    return ModulesLoader.loadSync(getPath(tpl));
}
export function resolveTpl(
    tpl: TemplateOrigin,
    includedTemplates: Common.IncludedTemplates,
    deps: Common.Deps<typeof Control>
):
    | Common.IDefaultExport<typeof Control>
    | typeof Control
    | TemplateFunction
    | Common.IDefaultExport<typeof Control>
    | Function
    | Common.ITemplateArray
    | ITplFunction<TemplateFunction> {
    if (typeof tpl === 'string') {
        if (Common.isLibraryModuleString(tpl)) {
            // if this is a module string, it probably is from a dynamic partial template
            // (ws:partial template="{{someString}}"). Split library name and module name
            // here and process it in the next `if tpl.library && tpl.module`
            const tplObject = Common.splitModule(tpl);
            return getLibraryTpl(tplObject, deps);
        }
        return Common.depsTemplateResolver(tpl, includedTemplates, deps);
    }
    if (Common.isLibraryModule(tpl)) {
        return getLibraryTpl(tpl, deps);
    }
    return tpl;
}

export function resolveTemplateArray(
    logicParent: Control<IControlOptions>,
    physicParent: Control<IControlOptions>,
    templateArray: Common.ITemplateArray<
        TemplateFunction | ITplFunction<TemplateFunction>
    >,
    resolvedScope: IControlOptions,
    decorAttribs: Attr.IAttributes,
    fullEvents: Record<string, TWasabyEvent[]>,
    generatorConfig: IGeneratorConfig,
    config: IControlConfig
): TemplateResult[] {
    let result = [];
    templateArray.forEach(
        (
            template: TemplateFunction | ITplFunction<TemplateFunction>,
            index: number
        ) => {
            if (Common.isTplFunction(template)) {
                template.func.templateIndex = index;
            } else if (typeof template === 'object') {
                template.templateIndex = index;
            }

            const templateAttributes = createTemplateAttributes(
                decorAttribs,
                fullEvents,
                config,
                generatorConfig
            );
            const context = templateAttributes.context;
            const resolvedTemplate = resolveTemplate.call(
                this,
                template,
                logicParent,
                physicParent,
                resolvedScope,
                templateAttributes,
                context,
                config
            );
            if (Array.isArray(resolvedTemplate)) {
                result = result.concat(resolvedTemplate);
            } else if (resolvedTemplate) {
                result.push(resolvedTemplate);
            }
        }
    );
    return result;
}

function resolveTemplate(
    template:
        | TemplateFunction
        | ITplFunction<TemplateFunction>
        | React.FunctionComponent,
    logicParent: Control<IControlOptions>,
    physicParent: Control<IControlOptions>,
    resolvedScope: IControlOptions,
    templateAttributes: IGeneratorAttrs,
    context: any,
    config: IControlConfig
): TemplateResult {
    let resolvedTemplate;
    if (typeof template === 'function') {
        resolvedTemplate = resolveTemplateFunction.call(
            this,
            logicParent,
            physicParent,
            template,
            resolvedScope,
            templateAttributes,
            context,
            config
        );
    } else if (Common.isTplFunction(template)) {
        template.func.internal = template.internal;
        resolvedTemplate = resolveTemplateFunction.call(
            this,
            logicParent,
            physicParent,
            template.func,
            resolvedScope,
            templateAttributes,
            context,
            config
        );
    } else {
        resolvedTemplate = template;
    }
    if (Array.isArray(resolvedTemplate)) {
        if (resolvedTemplate.length === 1) {
            return resolvedTemplate[0];
        }
        if (resolvedTemplate.length === 0) {
            // return null so that resolveTemplateArray does not add
            // this to the result array, since it is empty
            return null;
        }
    }
    return resolvedTemplate;
}

export function resolveTemplateFunction(
    logicParent: Control<IControlOptions>,
    physicParent: Control<IControlOptions>,
    template: TemplateFunction | Function,
    resolvedScope: IControlOptions,
    templateAttributes: IGeneratorAttrs,
    context: any,
    config: IControlConfig
): TemplateResult | React.ReactElement {
    // проверяем что это чистый реакт, тогда сразу строим элемент по определенным правилам
    let funcTemplate = template;
    if (Common.isTplFunction(template)) {
        funcTemplate = template.func;
    }
    if (reactCreator.isRelevant(funcTemplate)) {
        convertForwardedRefToRef(resolvedScope);
        return reactCreator.createFnComponent(
            funcTemplate as React.FunctionComponent,
            resolvedScope,
            templateAttributes,
            !!config.isVdom
        );
    }

    // Проверим функцию на анонимность, если это не чистый реакт.
    // Реакт не запрещает функциональные компоненты в виде анонимных функций.
    if (Common.isAnonymousFn(template)) {
        anonymousFnError(template, logicParent);
        return null;
    }

    const generatorConfig = this.config;

    // на сервисе представления сразу строим верстку, не нужно создавать шаблон как ноду с react.memo
    // а еще бывает что на клиенте строят текстовую верстку
    // а ещё на СП config.isVdom для wasaby контролов равен true.
    // todo вероятно этот код нужно вытащить в GeneratorVdom
    if (!config.isVdom || isServerSide) {
        templateAttributes._physicParent = physicParent;
        return template.call(
            logicParent,
            resolvedScope,
            templateAttributes,
            context,
            config.isVdom,
            undefined,
            undefined,
            generatorConfig
        ) as TemplateResult;
    }

    return createElementForTemplate(
        logicParent,
        physicParent,
        template,
        generatorConfig,
        resolvedScope,
        templateAttributes,
        context,
        config
    );
}

/**
 * Получает конструктор контрола по его названию и создаёт его с переданными опциями.
 * @param origin Либо сам шаблон/конструктор контрола, либо строка, по которой его можно получить.
 * @param scope Опции контрола.
 * @param templateAttributes атрибуты контрола
 * @param config
 */
function createWsControl(
    origin: typeof Control,
    scope: IControlOptions,
    templateAttributes: IGeneratorAttrs,
    config: IControlConfig
): React.ComponentElement<IControlOptions, Control<IControlOptions, TIState>> {
    scope._$attributes = templateAttributes;
    scope._$compound = !(origin && origin.isWasaby);
    scope._$internal = config.internal;

    if (scope._$compound) {
        if (
            origin.prototype._moduleName !== 'Core/CompoundContainer' &&
            !isUnitTestMode()
        ) {
            Logger.error(
                `В wasaby-окружении неправильно создается ws3-контрол. Необходимо использовать Core/CompoundContainer, а не вставлять ws3-контрол в шаблон wasaby-контрола напрямую.
         Подробнее тут https://wi.sbis.ru/doc/platform/developmentapl/ws3/compound-wasaby/
         Вставляется контрол '${
             origin && origin.prototype && origin.prototype._moduleName
         }' в шаблоне контрола `,
                scope._logicParent
            );
        }
        return;
    }

    if (templateAttributes.attributes?.key) {
        // переносим ключ чтобы он выставился именно для контрола,
        // а не для элемента внутри, чтобы избежать перерисовки контрола
        scope.key = templateAttributes.attributes.key;
        delete templateAttributes.attributes.key;
    } else {
        scope.key = config.key;
    }

    if (!isServerSide) {
        const chainOfRef = new ChainOfRef();
        if (scope.ref) {
            chainOfRef.add(new CreateOriginRef(scope.ref));
        }
        if (scope._$attrKey) {
            chainOfRef.add(new CreateAttrsRef(scope._$attrKey));
        }
        scope.ref = chainOfRef.execute();
    }

    // подготавливаем опции, чтобы не делать клон react props в контроле
    if (config && config.viewController) {
        const wasasbyContext = config.viewController;
        scope.readOnly = scope.readOnly ?? wasasbyContext?.readOnly;
        scope.theme = scope.theme ?? wasasbyContext?.theme;
        scope._registerAsyncChild =
            scope._registerAsyncChild ?? wasasbyContext?._registerAsyncChild;
        scope._physicParent =
            scope._physicParent ?? wasasbyContext?._physicParent;
        scope.pageData = scope.pageData ?? wasasbyContext.context?.pageData;
        scope._$preparedProps = true;
    }

    let flatScope = scope;
    if (config.unitedScope) {
        flatScope = flattenObject(flatScope);
    }
    return React.createElement(origin, flatScope);
}

/**
 * Получает шаблон по его названию и строит его.
 * @param origin Либо сам шаблон/конструктор контрола, либо строка, по которой его можно получить.
 * @param scope Опции шаблона.
 * @param templateAttributes
 * @param config
 * @param logicParent Контрол, внутри которого создается данный шаблон
 * @param physicParent Контрол, который является непосредственным родителем по дом-дереву
 */
function createTemplate(
    origin: TemplateFunction,
    scope: IControlOptions,
    templateAttributes: IGeneratorAttrs,
    config: IControlConfig,
    logicParent: Control<IControlOptions>,
    physicParent: Control<IControlOptions>
): TemplateResult {
    /*
    Контролы берут наследуемые опции из контекста.
    Шаблоны так не могут, потому что они не полноценные реактовские компоненты.
    Поэтому берём значения либо из опций, либо из родителя.
     */
    if (typeof scope.readOnly === 'undefined') {
        scope.readOnly =
            logicParent?.props?.readOnly ?? logicParent?.context?.readOnly;
    }
    if (typeof scope.theme === 'undefined') {
        scope.theme = logicParent?.props?.theme ?? logicParent?.context?.theme;
    }

    return resolveTemplateFunction.call(
        this,
        logicParent,
        physicParent,
        origin,
        scope,
        templateAttributes,
        undefined,
        config
    );
    // Получилась ситуация, что WasabyContextManager был сам в себе, и пошли ошибки с ref
    // выписана задача - https://online.sbis.ru/opendoc.html?guid=ed465ef5-7e32-4456-94b8-14b7892150e1
    // return React.createElement(
    //     WasabyContextManager,
    //     {
    //         readOnly: scope.readOnly,
    //         theme: scope.theme
    //     },
    //     resolveTemplateFunction(parent, resultingFn, scope, attributes)
    // );
}

export function logResolverError(
    tpl: TemplateOrigin,
    parent: Control<IControlOptions>
): void {
    if (typeof tpl !== 'string') {
        let errorText = 'Ошибка в шаблоне! ';
        if (Common.isLibraryModule(tpl)) {
            errorText += `Контрол не найден в библиотеке.
                Библиотека: ${(tpl as IGeneratorNameObject).library}.
                Контрол: ${(tpl as IGeneratorNameObject).module}`;
        } else {
            errorText += `Неверное значение в ws:partial. Шаблон: ${tpl} имеет тип ${typeof tpl}`;
        }
        Logger.error(errorText, parent);
    }
    if (typeof tpl === 'string' && tpl.split('!')[0] === 'wml') {
        // если у нас тут осталась строка то проверим не путь ли это до шаблона
        // если это так, значит мы не смогли построить контрол, т.к. указан не существующий шаблон
        Logger.error(
            'Ошибка при построение контрола. Проверьте существует ли шаблон ' +
                tpl,
            parent
        );
    }
}

function anonymousFnError(
    fn: TemplateFunction | Function,
    parent: Control<IControlOptions>
): void {
    Logger.error(
        `Ошибка построения разметки. Была передана функция, которая не является шаблонной.
               Функция: ${fn.toString()}`,
        parent
    );
}
