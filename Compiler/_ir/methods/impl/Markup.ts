/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * @author Krylov M.A.
 *
 * Код частично перенесен из модуля
 *   UICommon/_executor/TClosure.tsx
 *   Нужно реогранизовать используемые модули.
 */

import type { IGenerator as IMarkupGenerator } from 'UICommon/Executor';

import type { IAttributes, IDataArray, IteratorScope } from '../Interface';

import Base from './Base';
import MustacheExpressionError from '../utils/Error';
import { extractValue, implantValue } from '../utils/Object';

import { TClosure } from 'UI/Executor';
import { Logger } from 'UICommon/Utils';

/**
 * @private
 */
export default class Markup extends Base {

//# region implementation of interface IMethods

    sanitize(content: unknown): unknown {
        return TClosure.Sanitize(content);
    }

    wrapUndefined(value: { _moduleName: string; }): unknown {
        return TClosure.wrapUndef(value);
    }

    wrapString(value: unknown): string {
        return `${value}`;
    }

    getResourceURL(url: string): string {
        return TClosure.getResourceUrl(url);
    }

    getter(
        dataSource: unknown,
        path: string[]
    ): unknown {
        return extractValue(dataSource, path);
    }

    setter(
        dataSource: unknown,
        path: string[],
        value: unknown
    ): unknown {
        return implantValue(dataSource, path, value);
    }

    decorate(
        name: string,
        args: unknown[] = []
    ): unknown {
        return this.viewDecorators[name](args);
    }

    call(
        funcContext: unknown,
        dataSource: unknown,
        path: string[],
        args: unknown[] = []
    ): unknown {
        const fn = this.getter(dataSource, path);
        if (typeof fn !== 'function') {
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_NOT_A_FUNCTION,
                `${path.slice(-1)} is not a function`
            );
        }

        return fn.apply(funcContext, args);
    }

    call2(
        dataSource: unknown,
        path: string[],
        args: unknown[] = []
    ): unknown {
        const context = this.getter(dataSource, path.slice(0, -1));
        if (context === undefined || context === null) {
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_CANNOT_READ_PROPERTIES,
                `Cannot read properties of ${context} (reading '${path.slice(-1)}')`
            );
        }

        return this.call(context, context, path.slice(-1), args);
    }

    dots(data: unknown): unknown {
        // uniteScope(data, { parent: undefined, element: undefined })(plainMerge)

        return this.uniteScope(data, { parent: undefined, element: undefined })(TClosure.plainMerge);
    }

//# endregion

//# region implementation of interface IPrivateMethods

    filterOptions(options: unknown): unknown {
        return TClosure.filterOptions(options);
    }

    validateNodeKey(key: number | string): number | string {
        return TClosure.validateNodeKey(key);
    }

    createScope(scope: object): Record<string, unknown> {
        return TClosure.createScope(scope) as Record<string, unknown>;
    }

    getContext(obj: unknown): unknown {
        return TClosure.getContext(obj);
    }

    getTypeFunc(
        name: string,
        data: unknown
    ): unknown {
        return TClosure.getTypeFunc(name, data);
    }

    createDataArray(
        array: unknown[],
        fileName: string,
        isWasabyTemplate: boolean,
        isVdom: boolean
    ): IDataArray {
        return TClosure.createDataArray(array, fileName, isWasabyTemplate, isVdom);
    }

    uniteScope(
        inner: unknown,
        outer: unknown
    ): Function {
        return TClosure.uniteScope(inner, outer);
    }

    plainMerge(
        inner: unknown,
        outer: unknown,
        cloneFirst?: unknown
    ): unknown {
        return TClosure.plainMerge(inner, outer, cloneFirst);
    }

    processMergeAttributes(
        inner: IAttributes,
        outer: IAttributes
    ): IAttributes {
        return TClosure.processMergeAttributes(inner, outer);
    }

    plainMergeAttr(
        inner: unknown,
        outer: unknown
    ): unknown {
        return TClosure.plainMergeAttr(inner, outer);
    }

    plainMergeContext(
        inner: unknown,
        outer: unknown
    ): unknown {
        return TClosure.plainMergeContext(inner, outer);
    }

    calcParent(
        obj: unknown,
        propertyName: unknown,
        data: unknown
    ): unknown {
        return TClosure.calcParent(obj, propertyName, data);
    }

    presetScope(
        object: unknown,
        data: unknown,
        key: unknown,
        iteratorScope: IteratorScope
    ): unknown {
        return TClosure.presetScope(object, data, key, iteratorScope);
    }

    createGenerator(
        isVdom: boolean,
        forceCompatible: boolean,
        config: unknown
    ): IMarkupGenerator {
        return TClosure.createGenerator(isVdom, forceCompatible, config);
    }

    templateError(
        fileName: string,
        error: Error,
        data: unknown
    ): void {
        Logger.templateError('Failed to generate html', fileName, data, error);
    }

    isolateScope(
        scope: object,
        data: object,
        propertyName: string
    ): Record<string, unknown> {
        return TClosure.isolateScope(scope, data, propertyName);
    }

    makeFunctionSerializable(
        func: unknown,
        scope: unknown
    ): unknown {
        // TODO: реализовать новую сериализацию
        return undefined;
    }

//# endregion
}
