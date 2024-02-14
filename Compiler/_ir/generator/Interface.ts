/**
 * @author Krylov M.A.
 */

import type { IContext, TemplateBody, TMustache } from '../core/Interface';
import type { IDataArray, IPrivateMethods } from '../methods/Interface';

export declare type TControlMethod = string | { library: string; module: string; };

/**
 * Конфигурация узла типа html element.
 *
 * @public
 */
export interface IElementConfiguration {

    /**
     * (key) Ключ создаваемого узла.
     */
    K: string;

    /**
     * (attributes) Коллекция атрибутов, данные которой были получены из шаблона.
     */
    A?: Record<string, unknown>;

    /**
     * (events) Коллекция обработчиков событий, данные которой были получены из шаблона.
     */
    E?: Record<string, unknown>;

    /**
     * (isRootElementNode) Флаг корневого узла.
     */
    r?: boolean;

    /**
     * (isContainerNode) Флаг узла, который содержит контейнер.
     */
    c?: boolean;
}

/**
 * Опции узла типа html element.
 *
 * @public
 */
export interface IComponentConfiguration extends IElementConfiguration {

    /**
     * (options) Коллекция опций, данные которой были получены из шаблона.
     */
    O?: Record<string, unknown>;

    /**
     * (mergeType) Способ объединения данных.
     */
    m?: 'none' | 'attribute' | 'context';

    /**
     * (blockOptionNames) Список опций, которые были заданы тегом.
     */
    b?: string[];

    /**
     * (isRootComponentNode, isRootTag) Опция корневого компонента.
     */
    g?: boolean;

    /**
     * (compositeAttributes) Коллекция атрибутов, которые были переданы объектом.
     */
    a?: unknown;

    /**
     * (refForContainer) Опция передачи ref.
     */
    f?: boolean;

    /**
     * (internalsMetaId) Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    i?: number;
}

/**
 * Интерфейс части генератора, отвечающей за построение верстки.
 *
 * @public
 */
export interface INodeGenerator {

    /**
     * Выполнить экранирование данных.
     * @param {*} value Данные для экранирования.
     */
    escape(
        value: unknown
    ): unknown;

    /**
     * Создать текстовый узел.
     * @param {string} text Содержимое узла.
     * @param {string?} key Ключ узла.
     */
    createText(
        text?: string,
        key?: string
    ): unknown;

    /**
     * Создать директиву.
     * @param {string} text Содержимое директивы.
     */
    createDirective(
        text: string
    ): unknown;

    /**
     * Создать комментарий.
     * @param {string} text Содержимое комментария.
     */
    createComment(
        text: string
    ): unknown;

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
        children?: unknown[]
    ): unknown;

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
    createControl(
        context: IContext,
        method: TControlMethod,
        configuration: IComponentConfiguration
    ): unknown;

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
    createPartial(
        context: IContext,
        method: unknown,
        configuration: IComponentConfiguration
    ): unknown;

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
    createTemplate(
        context: IContext,
        method: string,
        configuration: IComponentConfiguration
    ): unknown;

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
    createInline(
        context: IContext,
        referenceId: number,
        configuration: IComponentConfiguration
    ): unknown;
}

/**
 * Алиасы публичных методов для компиляции в режиме релиза.
 *
 * @public
 */
export interface IGeneratorMinified {
    e: INodeGenerator['escape'];
    t: INodeGenerator['createText'];
    d: INodeGenerator['createDirective'];
    c: INodeGenerator['createComment'];
    g: INodeGenerator['createTag'];
    C: INodeGenerator['createControl'];
    P: INodeGenerator['createPartial'];
    T: INodeGenerator['createTemplate'];
    I: INodeGenerator['createInline'];
    D: IGenerator['evalDefaultScope'];
    s: IGenerator['evalOptionsScope'];
    S: IGenerator['evalScope'];
    m: IGenerator['evalExpression'];
    x: IGenerator['evalExpression2'];
    M: IGenerator['closeExpression'];
    B: IGenerator['closeBindExpression'];
    o: IGenerator['createContentOption'];
    O: IGenerator['evalContentOption'];
    F: IGenerator['createFunction'];
    i: IGenerator['if'];
    r: IGenerator['for'];
    h: IGenerator['foreach'];
}

/**
 * Алиасы публичных методов для компиляции в режиме релиза.
 *
 * @public
 */
export interface IChainMinified {
    i: IChain['elif'];
    e: IChain['else'];
    f: IChain['fi'];
}

/**
 * Интерфейс публичной части цепочки условных выражений.
 *
 * @public
 */
export interface IChain extends IChainMinified {

    /**
     * Объявить дополнительную else-if ветку условной цепочки.
     * @param {TMustache} test Идентификатор Mustache-выражения.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    elif(test: TMustache, body: TemplateBody): this;

    /**
     * Объявить дополнительную if ветку условной цепочки.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    else(body: TemplateBody): this;

    /**
     * Завершить вычисление условной цепочки.
     * Вызов данной функции обязателен!
     */
    fi(): unknown[];
}

/**
 * Приватный интерфейс условной цепочки, который используется генератором.
 *
 * @private
 */
export interface IPrivateChain extends IChain {

    /**
     * Вычислить узел if условной цепочки.
     * @param {TMustache} test Идентификатор Mustache-выражения.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    if(test: TMustache, body: TemplateBody): this;
}

/**
 * Интерфейс публичной части генератора, который доступен всем функциям типа TemplateBody.
 * Определяет методы для вычисления Mustache выражения и управления потоком вычисления.
 *
 * @public
 */
export interface IGenerator extends INodeGenerator, IGeneratorMinified {

    /**
     * Создать опции компонента с объединением по scope, где scope="{{ ... }}".
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     */
    evalDefaultScope(
        context: IContext,
        options: Record<string, unknown>
    ): unknown;

    /**
     * Создать опции компонента с объединением по scope, где scope="{{ _options }}".
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     * @param {object} scope Значение опции scope.
     */
    evalOptionsScope(
        context: IContext,
        options: Record<string, unknown>,
        scope: object
    ): unknown;

    /**
     * Создать опции компонента с объединением по scope.
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     * @param {object} scope Значение опции scope. Пользовательский объект.
     */
    evalScope(
        context: IContext,
        options: Record<string, unknown>,
        scope: object
    ): unknown;

    /**
     * Вычислить Mustache выражение.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} expression Функция типа MustacheExpression,
     * либо идентификатор выражения из таблицы выражений шаблонной функции.
     */
    evalExpression(
        context: IContext,
        expression: TMustache
    ): unknown;

    /**
     * Вычислить Mustache выражение с выполнением wrapUndefined результата вычисления.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} expression Функция типа MustacheExpression,
     * либо идентификатор выражения из таблицы выражений шаблонной функции.
     */
    evalExpression2(
        context: IContext,
        expression: TMustache
    ): unknown;

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
    ): Function;

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
    ): Function;

    /**
     * Создать контентную опцию.
     * @param {IContext} context Контекст выполнения.
     * @param {number} content Идентификатор контентной опции.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    createContentOption(
        context: IContext,
        content: number,
        internalsMetaId?: number
    ): IDataArray;

    /**
     * Вызвать контентную опцию.
     * В шаблоне это контентная опция с типом string.
     * @param {IContext} context Контекст выполнения.
     * @param {number} content Идентификатор контентной опции.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    evalContentOption(
        context: IContext,
        content: number,
        internalsMetaId?: number
    ): unknown;

    /**
     * Создать функцию-обработчик.
     * Происходит из конструкции ws:Function.
     * @param {IContext} context Контекст выполнения.
     * @param {string} name Имя библиотеки и название функции.
     * @param {object} data Коллекция параметров функции.
     */
    createFunction(
        context: IContext,
        name: string,
        data: object
    ): unknown;

    /**
     * Вычислить условие.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} test Идентификатор выражения условия из таблицы выражений.
     * @param {TemplateBody} body Функция, описывающая тело уловного блока.
     */
    if(
        context: IContext,
        test: TMustache,
        body: TemplateBody
    ): IChain;

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
     * @param {TMustache?} init Необязательный идентификатор init-выражения цикла.
     * @param {TMustache} test Идентификатор test-выражения цикла.
     * @param {TMustache?} update Необязательный идентификатор update-выражения цикла.
     * @param {TemplateBody} body Функция, описывающая тело цикла.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    for(
        context: IContext,
        id: number,
        init: TMustache,
        test: TMustache,
        update: TMustache,
        body: TemplateBody,
        internalsMetaId?: number
    ): unknown[];

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
     * @param {string[]} identifiers Имена идентификаторов цикла для key, value.
     * @param {TMustache} collection Идентификатор выражения получения итерируемой коллекции.
     * @param {TemplateBody} body Функция, описывающая тело цикла.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    foreach(
        context: IContext,
        id: number,
        identifiers: string[],
        collection: TMustache,
        body: TemplateBody,
        internalsMetaId?: number
    ): unknown[];
}

/**
 * Интерфейс коллекции вычисленных internal выражений для механизма dirty check.
 *
 * @private
 */
export interface IInternalCollection {
    [name: string]: unknown;
}

/**
 * Интерфейс генератора, который необходим перед и после вызова функции типа TemplateBody.
 * Используется в замыканиях для подготовки данных и обработки результата.
 *
 * @private
 */
export interface IPrivateGenerator extends IGenerator {
    readonly methods: IPrivateMethods;

    prepareDataForCreate(
        tpl: unknown,
        scope: unknown,
        attributes: unknown,
        deps: unknown
    ): unknown;
}

/**
 * Интерфейс генератора, который вычисляет mustache выражения и собирает коллекцию internal
 * для механизма dirty checking.
 *
 * @private
 */
export interface IPrivateInternalGenerator {

    /**
     * Вычислить набор internal.
     * @param {IContext} context Контекст выполнения.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    evalInternal(context: IContext, internalsMetaId?: number): IInternalCollection;
}
