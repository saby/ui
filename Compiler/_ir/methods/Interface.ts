/**
 * @author Krylov M.A.
 */

import type { IGenerator as IMarkupGenerator, IGeneratorConfig } from 'UICommon/Executor';

export declare type IAttributes = Record<string, string>;

/**
 * Алиасы публичных методов для компиляции в режиме релиза.
 *
 * @public
 */
export interface IMethodsMinified {
    t: IMethods['sanitize'];
    u: IMethods['wrapUndefined'];
    S: IMethods['wrapString'];
    g: IMethods['getter'];
    s: IMethods['setter'];
    d: IMethods['decorate'];
    c: IMethods['call'];
    C: IMethods['call2'];
    r: IMethods['getResourceURL'];
    D: IMethods['dots'];
}

/**
 * Публичный интерфейс, который доступен всем функциям типа MustacheExpression.
 * Определяет методы для вычисления Mustache выражений и прочие вспомогательные методы,
 * востребованные внутри TemplateBody.
 *
 * @public
 */
export interface IMethods extends IMethodsMinified {

    sanitize(content: unknown): unknown;

    wrapUndefined(value: { _moduleName: string; }): unknown;

    wrapString(value: unknown): string;

    getResourceURL(url: string): string;

    getter(
        dataSource: unknown,
        path: string[]
    ): unknown;

    setter(
        dataSource: unknown,
        path: string[],
        value: unknown
    ): unknown;

    decorate(
        name: string,
        args?: unknown[]
    ): unknown;

    // Эквивалент getter(dataSource, path).apply(funcContext, args)
    call(
        funcContext: unknown,
        dataSource: unknown,
        path: string[],
        args?: unknown[]
    ): unknown;

    // Эквивалент getter(dataSource, path).apply(getter(dataSource, path[ : -1]), args) для вычисляемых контекстов
    call2(
        dataSource: unknown,
        path: string[],
        args?: unknown[]
    ): unknown;

    dots(data: unknown): unknown;
}

/**
 * Интерфейс ws:Function.
 *
 * @public
 */
export interface IWasabyFunction<T> extends Array<T> {
    readonly isDataArray: true;
    readonly isWasabyTemplate: boolean;

    toString(): string;
}

/**
 * Интерфейс контентной опции.
 *
 * @public
 */
export interface IContentOption<T> extends Function {
    readonly isDataArray: true;
    readonly isWasabyTemplate: boolean;

    array: IWasabyFunction<T>;

    toString(): string;
}

/**
 * Тип служебного массива обертки для контентной опции и ws:Function.
 */
export declare type IDataArray = IContentOption<unknown> | IWasabyFunction<unknown>;

/**
 * Опции итератора.
 *
 * @public
 */
export interface IteratorScope {
    value: string;
    key?: string;
}

/**
 * Приватный интерфейс, который необходим перед и после вызова функций типа TemplateBody.
 * Используется в замыканиях для подготовки данных и обработки результата.
 *
 * @private
 */
export interface IPrivateMethods extends IMethods {

    filterOptions(options: unknown): unknown;

    validateNodeKey(key: number | string): number | string;

    createScope(scope: object): Record<string, unknown>;

    getContext(obj: unknown): unknown;

    getTypeFunc(
        name: string,
        data: unknown
    ): unknown;

    createDataArray(
        array: unknown[],
        fileName: string,
        isWasabyTemplate: boolean,
        isVdom: boolean
    ): IDataArray;

    uniteScope(
        inner: unknown,
        outer: unknown
    ): Function;

    plainMerge(
        inner: unknown,
        outer: unknown,
        cloneFirst?: unknown
    ): unknown;

    processMergeAttributes(
        inner: IAttributes,
        outer: IAttributes
    ): IAttributes;

    plainMergeAttr(
        inner: unknown,
        outer: unknown
    ): unknown;

    plainMergeContext(
        inner: unknown,
        outer: unknown
    ): unknown;

    calcParent(
        obj: unknown,
        propertyName: string,
        data: unknown
    ): unknown;

    presetScope(
        object: unknown,
        data: unknown,
        key: unknown,
        iteratorScope: IteratorScope
    ): unknown;

    createGenerator(
        isVdom: boolean,
        forceCompatible: boolean,
        config: IGeneratorConfig
    ): IMarkupGenerator;

    templateError(
        fileName: string,
        error: Error,
        data: unknown
    ): void;

    isolateScope(
        scope: object,
        data: object,
        propertyName?: string
    ): Record<string, unknown>;
}
