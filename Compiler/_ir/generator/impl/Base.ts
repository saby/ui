/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * @author Krylov M.A.
 */

import type {
    IPrivateGenerator,
    TControlMethod,
    IElementConfiguration,
    IComponentConfiguration
} from '../Interface';

import type { IContext, TemplateBody, TMustache } from '../../core/Interface';
import type { IDataArray, IPrivateMethods } from '../../methods/Interface';

/**
 * Базовый класс генератора, предоставляющий общие методы для генераторов markup и internal.
 * Реализует методы интерфейса IGeneratorMinified.
 *
 * @private
 */
export default abstract class Base implements IPrivateGenerator {
    protected constructor(
        readonly methods: IPrivateMethods
    ) { }

//# region implementation of interface IGeneratorMinified

    e(value: unknown): unknown {
        return this.escape(value);
    }

    t(text: string, key: string): unknown {
        return this.createText(text, key);
    }

    d(text: string): unknown {
        return this.createDirective(text);
    }

    c(text: string): unknown {
        return this.createComment(text);
    }

    g(context: IContext, name: string, options: IElementConfiguration, children: unknown[]): unknown {
        return this.createTag(context, name, options, children);
    }

    C(context: IContext, method: TControlMethod, options: IComponentConfiguration): unknown {
        return this.createControl(context, method, options);
    }

    P(context: IContext, method: unknown, options: IComponentConfiguration): unknown {
        return this.createPartial(context, method, options);
    }

    T(context: IContext, method: string, options: IComponentConfiguration): unknown {
        return this.createTemplate(context, method, options);
    }

    I(context: IContext, referenceId: number, options: IComponentConfiguration): unknown {
        return this.createInline(context, referenceId, options);
    }

    D(context: IContext, options: Record<string, unknown>): unknown {
        return this.evalDefaultScope(context, options);
    }

    s(context: IContext, options: Record<string, unknown>, scope: object): unknown {
        return this.evalOptionsScope(context, options, scope);
    }

    S(context: IContext, options: Record<string, unknown>, scope: object): unknown {
        return this.evalScope(context, options, scope);
    }

    m(context: IContext, expression: TMustache): unknown {
        return this.evalExpression(context, expression);
    }

    x(context: IContext, expression: TMustache): unknown {
        return this.evalExpression2(context, expression);
    }

    M(context: IContext, expression: TMustache): Function {
        return this.closeExpression(context, expression);
    }

    B(context: IContext, expression: TMustache): Function {
        return this.closeBindExpression(context, expression);
    }

    o(context: IContext, content: number, internalsMetaId: number): IDataArray {
        return this.createContentOption(context, content, internalsMetaId);
    }

    O(context: IContext, content: number, internalsMetaId: number): unknown {
        return this.evalContentOption(context, content, internalsMetaId);
    }

    F(context: IContext, name: string, data: object): unknown {
        return this.createFunction(context, name, data);
    }

    r(
        context: IContext,
        id: number,
        init: number,
        test: number,
        update: number,
        body: TemplateBody,
        internalsMetaId: number
    ): unknown[] {
        return this.for(context, id, init, test, update, body, internalsMetaId);
    }

    h(
        context: IContext,
        id: number,
        identifiers: string[],
        collection: number,
        body: TemplateBody,
        internalsMetaId: number
    ): unknown[] {
        return this.foreach(context, id, identifiers, collection, body, internalsMetaId);
    }

//# endregion

//# region interface INodeGenerator

    /**
     * Выполнить экранирование данных.
     * @param {*} value Данные для экранирования.
     */
    abstract escape(
        value: unknown
    ): unknown;

    /**
     * Создать текстовый узел.
     * @param {string} text Содержимое узла.
     * @param {string?} key Ключ узла.
     */
    abstract createText(
        text?: string,
        key?: string
    ): unknown;

    /**
     * Создать директиву.
     * @param {string} text Содержимое директивы.
     */
    abstract createDirective(
        text: string
    ): unknown;

    /**
     * Создать комментарий.
     * @param {string} text Содержимое комментария.
     */
    abstract createComment(
        text: string
    ): unknown;

    /**
     * Создать тег.
     * @param {IContext} context Контекст выполнения.
     * @param {string} name Имя тега.
     * @param {IElementConfiguration} configuration Атрибуты и обработчики событий узла.
     * @param {*[]} children Дочерние узлы.
     */
    abstract createTag(
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
    abstract createControl(
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
    abstract createPartial(
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
    abstract createTemplate(
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
    abstract createInline(
        context: IContext,
        referenceId: number,
        configuration: IComponentConfiguration
    ): unknown;

//# endregion

//# region interface IGenerator

    /**
     * Создать опции компонента с объединением по scope, где scope="{{ ... }}".
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     */
    abstract evalDefaultScope(
        context: IContext,
        options: Record<string, unknown>
    ): unknown;

    /**
     * Создать опции компонента с объединением по scope, где scope="{{ _options }}".
     * @param {IContext} context Контекст выполнения.
     * @param {Record<string, *>} options Опции компонента.
     * @param {object} scope Значение опции scope.
     */
    abstract evalOptionsScope(
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
    abstract evalScope(
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
    abstract evalExpression(
        context: IContext,
        expression: TMustache
    ): unknown;

    /**
     * Вычислить Mustache выражение с выполнением wrapUndefined результата вычисления.
     * @param {IContext} context Контекст выполнения.
     * @param {TMustache} expression Функция типа MustacheExpression,
     * либо идентификатор выражения из таблицы выражений шаблонной функции.
     */
    abstract evalExpression2(
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
    abstract closeExpression(
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
    abstract closeBindExpression(
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
    abstract createContentOption(
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
    abstract evalContentOption(
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
    abstract createFunction(
        context: IContext,
        name: string,
        data: object
    ): unknown;

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
    abstract for(
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
    abstract foreach(
        context: IContext,
        id: number,
        identifiers: string[],
        collection: TMustache,
        body: TemplateBody,
        internalsMetaId?: number
    ): unknown[];


//# endregion

//# region interface IPrivateGenerator

    abstract prepareDataForCreate(
        tpl: unknown,
        scope: unknown,
        attributes: unknown,
        deps: unknown
    ): unknown;

//# endregion
}
