/**
 * @author Krylov M.A.
 */

import type { IGenerator as IMarkupGenerator, IGeneratorConfig } from 'UICommon/Executor';

import type { IPrivateMethods } from '../Interface';
import type { IAttributes, IDataArray, IteratorScope } from '../Interface';

/**
 * Базовый класс, предоставляющий общие методы для набора методов markup и internal.
 * Реализует методы интерфейса IMinifiedMethods.
 *
 * @private
 */
export default abstract class Base implements IPrivateMethods {

//# region Lazy getters

    private lazyViewDecorators: {
        [name: string]: Function;
    };

    protected get viewDecorators() {
        if (!this.lazyViewDecorators) {
            this.lazyViewDecorators = require('View/decorators');
        }

        return this.lazyViewDecorators;
    }

//# endregion

//# region implementation of interface IMinifiedMethods

    t(content: unknown): unknown {
        return this.sanitize(content);
    }

    u(value: { _moduleName: string; }): unknown {
        return this.wrapUndefined(value);
    }

    S(value: unknown): string {
        return this.wrapString(value);
    }

    g(dataSource: unknown, path: string[]): unknown {
        return this.getter(dataSource, path);
    }

    s(dataSource: unknown, path: string[], value: unknown): unknown {
        return this.setter(dataSource, path, value);
    }

    d(name: string, args?: unknown[]): unknown {
        return this.decorate(name, args);
    }

    c(funcContext: unknown, dataSource: unknown, path: string[], args?: unknown[]): unknown {
        return this.call(funcContext, dataSource, path, args);
    }

    C(dataSource: unknown, path: string[], args?: unknown[]): unknown {
        return this.call2(dataSource, path, args);
    }

    r(url: string): string {
        return this.getResourceURL(url);
    }

    D(data: unknown): unknown {
        return this.dots(data);
    }

//# endregion

//# region interface IMethods

    abstract filterOptions(options: unknown): unknown;

    abstract sanitize(content: unknown): unknown;

    abstract wrapUndefined(value: { _moduleName: string; }): unknown;

    abstract wrapString(value: unknown): string;

    abstract getResourceURL(url: string): string;

    abstract getter(
        dataSource: unknown,
        path: string[]
    ): unknown;

    abstract setter(
        dataSource: unknown,
        path: string[],
        value: unknown
    ): unknown;

    abstract decorate(
        name: string,
        args?: unknown[]
    ): unknown;

    abstract call(
        funcContext: unknown,
        dataSource: unknown,
        path: string[],
        args?: unknown[]
    ): unknown;

    abstract call2(
        dataSource: unknown,
        path: string[],
        args?: unknown[]
    ): unknown;

    abstract dots(data: unknown): unknown;

//# endregion

//# region interface IPrivateMethods

    abstract validateNodeKey(key: number | string): number | string;

    abstract createScope(scope: object): Record<string, unknown>;

    abstract getContext(obj: unknown): unknown;

    abstract getTypeFunc(
        name: string,
        data: unknown
    ): unknown;

    abstract createDataArray(
        array: unknown[],
        fileName: string,
        isWasabyTemplate: boolean,
        isVdom: boolean
    ): IDataArray;

    abstract uniteScope(
        inner: unknown,
        outer: unknown
    ): Function;

    abstract plainMerge(
        inner: unknown,
        outer: unknown,
        cloneFirst?: unknown
    ): unknown;

    abstract processMergeAttributes(
        inner: IAttributes,
        outer: IAttributes
    ): IAttributes;

    abstract plainMergeAttr(
        inner: unknown,
        outer: unknown
    ): unknown;

    abstract plainMergeContext(
        inner: unknown,
        outer: unknown
    ): unknown;

    abstract calcParent(
        obj: unknown,
        propertyName: string,
        data: unknown
    ): unknown;

    abstract presetScope(
        object: unknown,
        data: unknown,
        key: unknown,
        iteratorScope: IteratorScope
    ): unknown;

    abstract createGenerator(
        isVdom: boolean,
        forceCompatible: boolean,
        config: IGeneratorConfig
    ): IMarkupGenerator;

    abstract templateError(
        fileName: string,
        error: Error,
        data: unknown
    ): void;

    abstract isolateScope(
        scope: object,
        data: object,
        propertyName?: string
    ): Record<string, unknown>;

//# endregion
}
