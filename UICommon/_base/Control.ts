import {IControl, IGeneratorConfig} from 'UICommon/Executor';
import * as React from 'react';

/**
 * Интерфейс опций базового контрола
 * @interface UICommon/_base/Control#IControlOptions
 * @property {String} rskey - ключ для сохранения/извлечения состояния из хранилища ReceivedState
 * @public
 */
export interface IControlOptions {
    readOnly?: boolean;
    theme?: string;
    notLoadThemes?: boolean;
    _$createdFromCode?: boolean;
    name?: string;
    rskey?: string;
    errorContainer?: React.ComponentClass;
    errorViewer?: IErrorViewer;
    _$logicParent?: any;
    _$attributes?: object & {
        _$logicParent: any
    };
    _$parentsChildrenPromises?: Promise<void>[];
    _$blockOptionNames?: string[];
}
// в опциях хранятся служебные поля, которые не должны влиять на перерисовку контрола в shouldComponentUpdate
export const skipChangedOptions = [
  '_$attributes',
  '_$createdFromCode',
  '_$parentsChildrenPromises',
  '_$blockOptionNames',
  // todo нужно переименовать в _$events или вообще удалить потому что они есть в атрибутах. опасно, может пересечься с прикладной опцией по имени
  // https://online.sbis.ru/opendoc.html?guid=488c7b3c-6c85-45d8-a13b-f1aff8c7e412
  'events'
];

/**
 * IErrorViewer необходим для отлова и показа ошибки в контроле WasabyOverReact
 */
interface IErrorViewer {
    process(error: Error): Promise<IErrorConfig | void> | IErrorConfig;
}

/**
 * Интерфейс для конфига ошибки для работы с ErrorViewer.
 */
interface IErrorConfig {
    _errorMessage: string;
    templateName?: string;
    error?: Error;
}

interface ITemplateFlags {
    stable: boolean;
    isWasabyTemplate?: boolean;
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
export type TemplateFunction = TTemplateFunction & ITemplateFlags;
