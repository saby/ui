/**
 * Модуль, предоставляющий базовые типы опций и методы для работы с ними.
 */

import type { IVersionable } from 'Types/entity';

//# region Type defenitions

export interface IVersionableArray<T> extends Array<T> {
    getArrayVersion(): number;
    _arrayVersion: number;
}

export declare type TBuiltIn =
    | Date
    | Map<unknown, unknown>
    | Set<unknown>
    | WeakMap<object, unknown>
    | WeakSet<object>
    | object
    | symbol
    | number
    | string
    | boolean
    | null
    | undefined;

export declare type TExtended =
    | TBuiltIn
    | IVersionable
    | IVersionableArray<IOptions>
    | TContentOption;

export interface IOptions extends Record<string, TExtended> {
    [property: string]: TExtended | IOptions;
}

export declare type TControlOptionsExtended = IOptions | null | undefined;

export declare type TInternalsCollection = Map<number, TExtended | IOptions>;

export declare type TVersionsCollection = Map<string, number>;

//# endregion

//# region Template function interfaces

export interface TContentOptionFunction extends Function {
    internal: TInternalsCollection;
    isWasabyTemplate: boolean;
}

export interface TContentOptionObject extends Object {
    func: TContentOptionFunction;
    internal: TInternalsCollection;
    isWasabyTemplate: boolean;
}

export interface IDataObject extends Object {
    isDataArray: boolean;
    isWasabyTemplate: boolean;
}

export declare type TDataArray<T> = T[] & IDataObject;

export interface IFunctionDataArray<T> extends Function, IDataObject {
    array: T[];
}

/**
 * Тип шаблонной функции контентной опции tmpl.
 */
export interface TWS3ContentOption extends TContentOptionFunction {
    toJSON?(): Function;
}

/**
 * Тип шаблонной функции контентной опции wml (VDOM).
 */
export declare type TWS4VDOMContentOption = IFunctionDataArray<TContentOptionObject>;

/**
 * Тип шаблонной функции контентной опции wml (не VDOM).
 */
export declare type TWS4NVDOMContentOption = TDataArray<TContentOptionObject>;

/**
 * Тип шаблонной функции контентной опции wml.
 */
export declare type TWS4ContentOption = TWS4VDOMContentOption | TWS4NVDOMContentOption;

/**
 * Тип шаблонной функции контентной опции.
 */
export declare type TContentOption = TWS3ContentOption | TWS4ContentOption;

/**
 * Тип контентной опции, сгенерированной из React элемента children.
 */
export declare type TChildrenAsContentOptions = { isChildrenAsContent?: boolean };

//# endregion

//# region Helper functions

const UNREACHABLE_GETTER_PATH_FLAG = -100;

export function areBothNaN(a: unknown, b: unknown): boolean {
    return typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
}

export function isContentOptionObject(value: unknown): value is TContentOptionObject {
    return !!(
        value &&
        typeof (value as TContentOptionObject).hasOwnProperty === 'function' &&
        (value as TContentOptionObject).hasOwnProperty('func') &&
        typeof (value as TContentOptionObject).func === 'function' &&
        (value as TContentOptionObject).hasOwnProperty('internal') &&
        (value as TContentOptionObject).hasOwnProperty('isWasabyTemplate')
    );
}

export function isWS3ContentOption(value: unknown): value is TWS3ContentOption {
    return (
        typeof value === 'function' &&
        typeof (value as TWS3ContentOption).hasOwnProperty === 'function' &&
        (value as TWS3ContentOption).hasOwnProperty('func') &&
        (value as TWS3ContentOption).hasOwnProperty('internal') &&
        (value as TWS3ContentOption).hasOwnProperty('isWasabyTemplate')
    );
}

export function getWS3ContentOptionInternals(value: TWS3ContentOption): TInternalsCollection {
    return value.internal;
}

export function isWS4NVDOMContentOption(value: unknown): value is TWS4NVDOMContentOption {
    return (
        Array.isArray(value) &&
        (value as TWS4NVDOMContentOption).isDataArray &&
        typeof (value as TWS4NVDOMContentOption).hasOwnProperty === 'function' &&
        (value as TWS4NVDOMContentOption).hasOwnProperty('isWasabyTemplate') &&
        (value as TWS4NVDOMContentOption).every(isContentOptionObject)
    );
}

export function isWS4VDOMContentOption(value: unknown): value is TWS4VDOMContentOption {
    return (
        !!value &&
        typeof value === 'function' &&
        (value as TWS4VDOMContentOption).isDataArray &&
        typeof (value as TWS4VDOMContentOption).hasOwnProperty === 'function' &&
        (value as TWS4VDOMContentOption).hasOwnProperty('isWasabyTemplate') &&
        Array.isArray((value as TWS4VDOMContentOption).array) &&
        (value as TWS4VDOMContentOption).array.every(isContentOptionObject)
    );
}

export function isWS4ContentOption(
    value: unknown
): value is TWS4NVDOMContentOption | TWS4VDOMContentOption {
    return isWS4NVDOMContentOption(value) || isWS4VDOMContentOption(value);
}

export function getWS4ContentOptionInternals(value: TWS4ContentOption): TInternalsCollection {
    if (isWS4NVDOMContentOption(value)) {
        // Контракт: контентная опция имеет строго 1 элемент
        return value[0].internal;
    }

    // Контракт: контентная опция имеет строго 1 элемент
    return value.array[0].internal;
}

export function isContentOption(value: unknown): value is TContentOption {
    return isWS4ContentOption(value) || isWS3ContentOption(value);
}

export function isVersionable(value: unknown): value is IVersionable {
    return !!(
        value &&
        typeof (value as IVersionable) === 'object' &&
        typeof (value as IVersionable).getVersion === 'function'
    );
}

export function isVersionableArray<T>(value: unknown): value is IVersionableArray<T> {
    return !!(
        value &&
        Array.isArray(value as IVersionableArray<T>) &&
        typeof (value as IVersionableArray<T>).getArrayVersion === 'function'
    );
}

export function isChildrenAsContent(value: unknown): boolean {
    return !!(value as TChildrenAsContentOptions).isChildrenAsContent;
}

export function shouldIgnoreChanging(value: IOptions | TExtended): boolean {
    return !!(value && (value as Record<string, boolean>)._ignoreChanging);
}

export function shouldCheckDeep(value: IOptions | TExtended): boolean {
    return !!(value && (value as Record<string, boolean>)._isDeepChecking);
}

export function shouldCheckVersions(value: IOptions | TExtended): boolean {
    return !!(value && (value as Record<string, boolean>)._preferVersionAPI);
}

export function shouldLazilyExit(value: TInternalsCollection): boolean {
    return value.has(UNREACHABLE_GETTER_PATH_FLAG);
}

export function installBlockOptionProperties(options: IOptions, blockOptionNames: string[]): void {
    for (const optionName of blockOptionNames) {
        const value = options[optionName];

        if (value && typeof options[optionName] === 'object') {
            Object.defineProperty(options[optionName], '_$blockOption', {
                value: true,
                enumerable: false,
            });
        }
    }
}

export function isBlockOption(value: TExtended | IOptions): boolean {
    return !!(value && (value as Record<string, boolean>)._$blockOption);
}

export function isPossiblyScopeObjectOfInternal(value: unknown): value is TControlOptionsExtended {
    return !!(
        value &&
        typeof value === 'object' &&
        // у scope есть _$internal
        (value as Record<string, boolean>)._$internal &&
        // We don't need to check Date object internal properties
        !(value instanceof Date) &&
        !isVersionable(value)
    );
}

//# endregion
