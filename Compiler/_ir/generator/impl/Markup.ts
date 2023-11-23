/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * @author Krylov M.A.
 */

import type { IControlConfig, IGenerator as UIGenerator } from 'UICommon/Executor';

import type {
    IComponentConfiguration,
    IElementConfiguration,
    IPrivateInternalGenerator,
    TControlMethod
} from '../Interface';
import type { IContext, TemplateBody, TMustache } from '../../core/Interface';
import type { IDataArray } from '../../methods/Interface';

import Base from './Base';
import Chain from '../flow/Chain';
import Iterator from '../flow/Iterator';
import Methods from 'Compiler/_ir/methods/impl/Markup';
import Internal from './Internal';
import { StandardController } from '../flow/Controller';
import { IRTemplateBodyType } from 'Compiler/_ir/core/IRTemplateBody';

interface IUnknown {
    [name: string]: IUnknown | unknown[] | unknown;
}

/**
 * Класс, реализующий методы построения верстки.
 *
 * @private
 */
export default class Markup extends Base {

    readonly uiGenerator: UIGenerator;
    readonly internal: IPrivateInternalGenerator;

    /**
     * Инициализировать новый инстанс генератора верстки.
     * @param {UIGenerator} uiGenerator Инстанс конкретного генератора,
     * методы которого вызываются внутри настоящего генератора.
     */
    constructor(uiGenerator: UIGenerator) {
        super(new Methods(), new StandardController());

        this.uiGenerator = uiGenerator;
        this.internal = new Internal();
    }

//# region implementation of interface INodeGenerator

    /**
     * Выполнить экранирование данных.
     * @param {*} value Данные для экранирования.
     */
    escape(value: unknown): unknown {
        // @ts-ignore TS2345: Argument of type 'unknown' is not assignable to parameter of type 'GeneratorObject'.
        return this.uiGenerator.escape(value);
    }

    /**
     * Создать текстовый узел.
     * @param {string} text Содержимое узла.
     * @param {string?} key Ключ узла.
     */
    createText(text: string = '', key: string = undefined): unknown {
        return this.uiGenerator.createText(`${text}`, key);
    }

    /**
     * Создать директиву.
     * @param {string} text Содержимое директивы.
     */
    createDirective(text: string): unknown {
        return this.uiGenerator.createDirective(text);
    }

    /**
     * Создать комментарий.
     * @param {string} text Содержимое комментария.
     */
    createComment(text: string): void { }

    /**
     * Создать тег.
     * @param {IContext} context Контекст выполнения.
     * @param {string} name Имя тега.
     * @param {IElementConfiguration} configuration Атрибуты и обработчики событий узла.
     * @param {*[]} children Дочерние узлы.
     */
    createTag(
        context: IContext,
        name: string,
        configuration: IElementConfiguration,
        children: unknown[] = []
    ): unknown {
        const key = `${context.key}${configuration.K}`;
        const attr = configuration?.r
            ? context.args.attr
            : (context.args.attr ? { context: context.args.attr.context, key } : { });

        const isControlTemplate = configuration?.c
            ? context.args.attr?.isControlTemplate
            : false;

        return this.uiGenerator.createTag(
            name,
            {
                key,
                attributes: configuration.A ?? { },
                events: configuration.E ?? { }
            },
            children,
            attr,
            context.defCollection,
            context.viewController,
            // @ts-ignore TS2554: Expected 3-6 arguments, but got 7.
            isControlTemplate
        );
    }

    /**
     * Создать контрол.
     * <pre>
     *     Поддерживаемые конструкции в шаблоне:
     *     <UI.Module.Control />
     *     <UI.Library:Control />
     * </pre>
     * @param {IContext} context Контекст выполнения.
     * @param {TControlMethod} method Имя контрола или объект для библиотечного контрола.
     * @param {IComponentConfiguration} configuration Объект-конфигурация, содержащая атрибуты,
     * обработчики событий, опции и дополнительные флаги.
     */
    createControl(context: IContext, method: TControlMethod, configuration: IComponentConfiguration): unknown {
        if (typeof method === 'string') {
            return this.uiGenerator.createControlNew(
                'wsControl',
                method,
                configuration.A ?? { },
                configuration.E ?? { },
                configuration.O ?? { },
                this.createControlConfiguration(context, configuration)
            );
        }

        return this.uiGenerator.createControlNew(
            'resolver',
            method,
            configuration.A ?? { },
            configuration.E ?? { },
            configuration.O ?? { },
            this.createResolverConfiguration(context, configuration)
        );
    }

    /**
     * Создать узел динамического ws:partial.
     * <pre>
     *     Поддерживаемые конструкции в шаблоне:
     *     <ws:partial template="{{ tmpl }}" />
     * </pre>
     * @param {IContext} context Контекст выполнения.
     * @param {*} method Функция шаблона, контрола или контентной опции.
     * @param {IComponentConfiguration} configuration Объект-конфигурация, содержащая атрибуты,
     * обработчики событий, опции и дополнительные флаги.
     */
    createPartial(context: IContext, method: unknown, configuration: IComponentConfiguration): unknown {
        return this.uiGenerator.createControlNew(
            'resolver',
            method,
            configuration.A ?? { },
            configuration.E ?? { },
            configuration.O ?? { },
            this.createResolverConfiguration(context, configuration)
        );
    }

    /**
     * Создать узел статического ws:partial.
     * <pre>
     *     Поддерживаемые конструкции в шаблоне:
     *     <ws:partial template="wml!path/to/template" />
     * </pre>
     * @param {IContext} context Контекст выполнения.
     * @param {string} method Имя модуля шаблона.
     * @param {IComponentConfiguration} configuration Объект-конфигурация, содержащая атрибуты,
     * обработчики событий, опции и дополнительные флаги.
     */
    createTemplate(context: IContext, method: string, configuration: IComponentConfiguration): unknown {
        return this.uiGenerator.createControlNew(
            'template',
            method,
            configuration.A ?? { },
            configuration.E ?? { },
            configuration.O ?? { },
            this.createControlConfiguration(context, configuration)
        );
    }

    /**
     * Создать inline-шаблон.
     * <pre>
     *     Поддерживаемые конструкции в шаблоне:
     *     <ws:partial template="inline template" />
     * </pre>
     * @param {IContext} context Контекст выполнения.
     * @param {number} referenceId Идентификатор inline-шаблона в таблице функций.
     * @param {IComponentConfiguration} configuration Объект-конфигурация, содержащая атрибуты,
     * обработчики событий, опции и дополнительные флаги.
     */
    createInline(context: IContext, referenceId: number, configuration: IComponentConfiguration): unknown {
        const attrsForTemplate = this.createInlineAttributes(context, configuration);

        attrsForTemplate.isInline = true;

        if (configuration.c) {
            attrsForTemplate.isContainerNodeInline = context.args.attr?.isControlTemplate;
        }

        if (configuration.f) {
            if (attrsForTemplate.isContainerNodeInline) {
                attrsForTemplate.refForContainer = ((context.args.attr as IUnknown)?.refForContainer);
            }
        }

        const scopeForTemplate = this.methods.plainMerge(
            Object.create(context.data || { }),
            this.prepareDataForCreate(
                '_$inline_template',
                configuration.O ?? { },
                attrsForTemplate,
                { }
            ),
            false
        );

        return context.global.templates[referenceId].call(
            context.self,
            scopeForTemplate,
            attrsForTemplate,
            context.args.context,
            context.args.isVdom
        );
    }

//# endregion

//# region implementation of interface IGenerator

    /**
     * Создать опции компонента с объединением по scope, где scope="{{ ... }}".
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     */
    evalDefaultScope(context: IContext, options: Record<string, unknown>): unknown {
        return this.methods.uniteScope(this.methods.dots(context.data), options);
    }

    /**
     * Создать опции компонента с объединением по scope, где scope="{{ _options }}".
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     * @param {object} scope Значение опции scope.
     */
    evalOptionsScope(context: IContext, options: Record<string, unknown>, scope: object): unknown {
        return this.methods.uniteScope(this.methods.filterOptions(scope), options);
    }

    /**
     * Создать опции компонента с объединением по scope.
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     * @param {object} scope Значение опции scope. Пользовательский объект.
     */
    evalScope(context: IContext, options: Record<string, unknown>, scope: object): unknown {
        return this.methods.uniteScope(scope, options);
    }

    /**
     * Вычислить Mustache выражение.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} expression Функция типа MustacheExpression,
     * либо идентификатор выражения из таблицы выражений шаблонной функции.
     */
    evalExpression(context: IContext, expression: TMustache): unknown {
        return context.global.expressions[expression].call(
            context.self,
            this.methods,
            context.data,
            context.funcContext,
            context.args.context,
            context.self?._children
        );
    }

    /**
     * Замкнуть Mustache-выражение, создав функцию для дальнейшего вызова с конкретным набором данных.
     * Создает общее замыкание, когда встроенные аргументы подменять не нужно,
     * а замкнутая функция вызывается с дополнительными параметрами, учтенными при компиляции.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} expression Функция типа MustacheExpression, либо идентификатор выражения
     * из таблицы выражений шаблонной функции.
     */
    closeExpression(
        context: IContext,
        expression: TMustache
    ): Function {
        const methods = this.methods;

        return function closedExpression(...args: unknown[]) {
            return context.global.expressions[expression].call(
                this,
                methods,
                context.data,
                context.funcContext,
                context.args.context,
                this._children,
                ...args
            );
        };
    }

    /**
     * Замкнуть Mustache-выражение, создав функцию для дальнейшего вызова с конкретным набором данных.
     * Создает специальное замыкание для обработчика bind с подменой встроенных аргументов.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} expression Функция типа MustacheExpression, либо идентификатор выражения
     * из таблицы выражений шаблонной функции.
     */
    closeBindExpression(
        context: IContext,
        expression: TMustache
    ): Function {
        const methods = this.methods;

        return function closedBindExpression(data: unknown, value: unknown) {
            return context.global.expressions[expression].call(
                this,
                methods,
                data,
                context.funcContext,
                context.args.context,
                context.self?._children,
                value
            );
        };
    }

    /**
     * Создать контентную опцию.
     * @param {IContext} context Контекст выполнения.
     * @param {number} content Идентификатор контентной опции.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    createContentOption(context: IContext, content: number, internalsMetaId?: number): IDataArray {
        const scope = Object.create(context.data);
        scope.viewController = context.viewController || null;

        const func = context.global.templates[content].bind(scope);
        func.isWasabyTemplate = context.global.isWasabyTemplate;

        const internal = this.internal.evalInternal(context, internalsMetaId);

        // FIXME: В запланированной работе по getChangedOptions учесть, что количество функций внутри контентной опции
        //   изменилось с "много" на 1. Из-за этого пропала часть перерисовок.
        //   В алгоритме getChangedOptions мы не смотрим на поле func, потому что это каждый раз новая функция (bound),
        //   нужно начать смотреть и избавиться от свойства __dirtyCheckingVars_000.
        internal.__dirtyCheckingVars_000 = context.global.templates[content];

        if (!context.global.isWasabyTemplate) {
            func.internal = internal;
            func.toString = () => func();

            if (typeof window === 'undefined') {
                func.toJSON = context.global.templates[content].toJSON;
            }

            return func;
        }

        return this.methods.createDataArray([{
                func,
                internal,
                isWasabyTemplate: context.global.isWasabyTemplate
            }],
            context.global.moduleName,
            context.global.isWasabyTemplate,
            context.args.isVdom
        );
    }

    /**
     * Вызвать контентную опцию.
     * В шаблоне это контентная опция с типом string.
     * @param {IContext} context Контекст выполнения.
     * @param {number} content Идентификатор контентной опции.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    evalContentOption(context: IContext, content: number, internalsMetaId?: number): unknown {
        const type = context.global.bodies[content].type;
        const scope = Object.create(context.data);
        scope.viewController = context.viewController || null;
        context.global.bodies[content].type = IRTemplateBodyType.INSTANT_EVAL_CONTENT;

        try {
            return context.global.templates[content].call(
                scope,
                Object.create(context.data),
                null,
                context.args.context
            );
        } catch (error) {
            throw error;
        } finally {
            context.global.bodies[content].type = type;
        }

    }

    /**
     * Создать функцию-обработчик.
     * Происходит из конструкции ws:Function.
     * @param {IContext} context Контекст выполнения.
     * @param {string} name Имя библиотеки и название функции.
     * @param {object} data Коллекция параметров функции.
     */
    createFunction(context: IContext, name: string, data: object): unknown {
        return this.methods.getTypeFunc(name, data);
    }

    /**
     * Вычислить условие.
     * @param {IContext} context Контекст выполнения.
     * @param {number} test Идентификатор выражения условия из таблицы выражений.
     * @param {TemplateBody} body Функция, описывающая тело уловного блока.
     */
    if(context: IContext, test: number, body: TemplateBody): Chain {
        // Необходимо положить пустой текстовый узел как значение по умолчанию для условной цепочки,
        // ни один из блоков которой не был выполнен, потому что "ничего" возвращать не можем.
        const defaultAlternateValue = this.createText();

        return new Chain(this.chainController.clone(), this, context, defaultAlternateValue)
            .if(test, body);
    }

    /**
     * Выполнить цикл "for".
     * <pre>
     *      Поддерживается цикл вида:
     *      <ws:for data="[ init() ]; test(); [ update() ]">
     *          ...
     *      </ws:for>
     * </pre>
     * @param {IContext} context Контекст выполнения.
     * @param {number} id Уникальный индекс цикла в пределах одного шаблона.
     * @param {number|undefined} init Необязательный идентификатор init-выражения цикла.
     * @param {number} test Идентификатор test-выражения цикла.
     * @param {number|undefined} update Необязательный идентификатор update-выражения цикла.
     * @param {TemplateBody} body Функция, описывающая тело цикла.
     */
    for(
        context: IContext,
        id: number,
        init: number,
        test: number,
        update: number,
        body: TemplateBody
    ): unknown[] {
        return new Iterator(this, context)
            .for(id, init, test, update, body);
    }

    /**
     * Выполнить цикл "foreach".
     * <pre>
     *      Поддерживается цикл вида:
     *      <ws:for data="[ key, ] value in collection">
     *          ...
     *      </ws:for>
     * </pre>
     * @param {IContext} context Контекст выполнения.
     * @param {number} id Уникальный индекс цикла в пределах одного шаблона.
     * @param {number} collection Идентификатор выражения получения итерируемой коллекции.
     * @param {string[]} identifiers Имена идентификаторов цикла для key, value.
     * @param {TemplateBody} body Функция, описывающая тело цикла.
     */
    foreach(
        context: IContext,
        id: number,
        identifiers: string[],
        collection: number,
        body: TemplateBody
    ): unknown[] {
        return new Iterator(this, context)
            .foreach(id, identifiers, collection, body);
    }

//# endregion

//# region implementation of interface IPrivateGenerator

    prepareDataForCreate(tpl: unknown, scope: unknown, attributes: unknown, deps: unknown): unknown {
        // @ts-ignore TS2339: Property 'prepareDataForCreate' does not exist on type 'IGenerator'.
        return this.uiGenerator.prepareDataForCreate(tpl, scope, attributes, deps);
    }

//# endregion

    private createInlineAttributes(context: IContext, configuration: IComponentConfiguration): IUnknown {
        const attributes = {
            attributes: configuration.A ?? { },
            events: configuration.E ?? { },
            key: `${context.key}${configuration.K}`,
            // FIXME: поправить типы
            inheritOptions: context.args.attr ? (context.args.attr as IUnknown).inheritOptions : { },
            internal: context.args.attr ? (context.args.attr as IUnknown).internal : { },
            context: context.args.attr ? (context.args.attr as IUnknown).context : { },
        };

        if (configuration.r) {
            return this.methods.plainMergeAttr(context.args.attr, attributes) as IUnknown;
        }

        return this.methods.plainMergeContext(context.args.attr, attributes) as IUnknown;
    }

    private createControlConfiguration(context: IContext, configuration: IComponentConfiguration): IControlConfig {
        const controlConfiguration: IControlConfig = {
            // Node information
            key: `${context.key}${configuration.K}`,
            internal: { },

            // Template function context information
            ctx: context.self,
            defCollection: context.defCollection,
            viewController: context.viewController,

            // Template function parameters information
            data: context.data,
            attr: context.args.attr,
            context: context.args.context,
            isVdom: context.args.isVdom,

            // Module context information
            depsLocal: context.global.depsLocal,
            includedTemplates: context.global.includedTemplates
        };

        if (context.pName) {
            controlConfiguration.pName = context.pName;
        }

        if (configuration.a) {
            controlConfiguration.compositeAttributes = configuration?.a;
        }

        if (configuration.g) {
            controlConfiguration.isRootTag = configuration?.g;
        }

        if (configuration.i) {
            controlConfiguration.internal = this.internal.evalInternal(context, configuration.i);
        }

        if (configuration.m) {
            controlConfiguration.mergeType = configuration?.m;
        }

        if (configuration.b) {
            controlConfiguration.blockOptionNames = configuration.b;
        }

        if (configuration.c) {
            // @ts-ignore TS2322: 'isContainerNode' does not exist in type 'IControlConfig'.
            controlConfiguration.isContainerNode = context.args.attr?.isControlTemplate;
        }

        return controlConfiguration;
    }

    private createResolverConfiguration(context: IContext, configuration: IComponentConfiguration): IControlConfig {
        const resolverConfiguration = this.createControlConfiguration(context, configuration);

        resolverConfiguration.context = context.args.isVdom
            ? `${context.args.context}part_${context.templateCount++}`
            : context.args.context;

        return resolverConfiguration;
    }
}