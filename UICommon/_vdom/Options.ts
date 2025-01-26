import { IVersionable } from 'Types/entity';
import { IControlOptions } from 'UICommon/Base';

export interface IVersionableArray {
    getArrayVersion?(): number;
    _arrayVersion?: number;
}

export interface IVersions {
    [property: string]: IVersions | number;
}

// TODO: Необходимо реализовать флаг, по которому будем определять этот интерфейс
//  Правка в кодогенерацию!
export interface ITemplate extends Object {
    func: Function;
    internal: IOptions;
}

// TODO: Необходимо реализовать флаг, по которому будем определять этот интерфейс
//  Правка в кодогенерацию!
export interface ITemplateArray extends Array<ITemplate> {
    isDataArray: boolean;
    array: ITemplate[];
}

// TODO: Необходимо реализовать флаг, по которому будем определять этот интерфейс
//  Правка в кодогенерацию!
export interface ITemplateObject extends ITemplate {
    isDataArray: boolean;
}

const IGNORE_CHANGING_FLAG = '_ignoreChanging';
const DEEP_CHECKING_FLAG = '_isDeepChecking';

export declare type TOptionValue =
    | IVersionable
    | IVersionableArray
    | ITemplateArray
    | ITemplateObject
    | Date
    | object
    | symbol
    | number
    | string
    | boolean
    | null
    | undefined;

export interface IManualObject extends Object {
    [property: string]: IManualObject | TOptionValue;
    [IGNORE_CHANGING_FLAG]?: boolean;
    [DEEP_CHECKING_FLAG]?: boolean;
}

export interface IOptions extends Object {
    [property: string]: IManualObject | TOptionValue;
}

export declare type TOptions = IOptions | IControlOptions;
