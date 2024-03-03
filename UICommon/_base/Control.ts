/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { IGeneratorConfig } from 'UICommon/Executor';
import { TEventObject } from 'UICommon/Events';
import * as React from 'react';

type TRefType = (node?: any) => void;
/**
 * Интерфейс опций базового контрола
 * @interface UICommon/_base/Control#IControlOptions
 * @property {String} rskey - ключ для сохранения/извлечения состояния из хранилища ReceivedState
 * @public
 */
export interface IControlOptions {
    readOnly?: boolean;
    theme?: string;
    pageData?: unknown;
    Router?: unknown;
    isAdaptive?: boolean;
    adaptiveMode?: unknown;
    workByKeyboard?: boolean;
    notLoadThemes?: boolean;
    _$createdFromCode?: boolean;
    _$iWantBeWS3?: boolean;
    name?: string;
    key?: string | number;
    _$key?: string;
    rskey?: string;
    _logicParent?: any;
    _physicParent?: any;
    content?: any;
    children?: React.ReactNode;
    parent?: any;
    _$attributes?: {
        key?: string;
        context?: Record<string, unknown>;
        _physicParent?: any;
        attributes?: Record<string, string>;
        reactEvent?: Record<string, Function>;
        refForContainer?: (node?: any) => void; // react only
    };
    customEvents?: string[];
    customEventsPreventConvertName?: boolean;
    _$events?: TEventObject;
    _$customEvents?: TEventObject;
    _registerAsyncChild?: Function;
    _$blockOptionNames?: string[];
    _$preparedProps?: boolean;
    _$templateKeyPostfix?: string;

    $wasabyRef?: any | TRefType;

    // атрибуты прокидываемые на элемент являются частью апи совместимости, и должны быть описаны в опциях
    className?: string;
    ignoreEventProps?: boolean;
}
// в опциях хранятся служебные поля, которые не должны влиять на перерисовку контрола в shouldComponentUpdate
export const skipChangedOptions = new Set([
    '_$attributes',
    '_$createdFromCode',
    '_$parentsChildrenPromises',
    '_$blockOptionNames',
    '_$events',
    '_physicParent',
    '_logicParent',
    '_registerAsyncChild',
    'forwardRef',
    'ref',
    'forwardedRef',
    '$wasabyRef',
    'viewController',
    '_$templateKeyPostfix',
    '_$compound',
    '_$internal',
]);

interface ITemplateFlags {
    stable: boolean;
    isWasabyTemplate?: boolean;
    internal?: boolean;
}

// TODO: в 3000 исправить тип возвращаемого значения. Только string для совместимости.
type TTemplateFunction = (
    data: object,
    attr?: object,
    context?: string,
    isVdom?: boolean,
    sets?: object,
    forceCompatible?: boolean,
    generatorConfig?: IGeneratorConfig
) => string;

/**
 * Тип шаблон-функции
 * @typedef UICommon/_base/Control#TemplateFunction
 * @public
 */
export type TemplateFunction = any;

/* TODO нужно разобраться с этим типом.
export type TemplateFunction = JSX.ElementClass
    & React.FunctionComponent<any>
    & TTemplateFunction & ITemplateFlags; */
