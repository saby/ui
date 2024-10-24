/* eslint-disable */
// @ts-nocheck

/**
 */

import { Serializer } from 'UICommon/State';
import { Logger } from 'UICommon/Utils';
import { ObjectUtils } from 'UICommon/Utils';
import { object } from 'Types/util';
import { constants } from 'Env/Env';
import * as Scope from './_Expressions/Scope';
import { Common, ConfigResolver } from './Utils';
import { IObject } from 'Types/entity';

/**
 * Коллекция поддерживаемых итераторов.
 */
interface IRecordSet {
    each: Function;
}
declare type TIteratorCallback = (entity: unknown, key: number | string) => void;

declare type TIterator = (collection: unknown, callback: TIteratorCallback) => unknown;

const iterators = [
    {
        type: 'recordset',
        is: function isRecordset(entity: unknown): boolean {
            return !!(
                entity &&
                Object.prototype.toString.call((entity as IRecordSet).each) === '[object Function]'
            );
        },
        iterator: function recordsetIterator(
            recordset: IRecordSet,
            callback: TIteratorCallback
        ): void {
            recordset.each(callback);
        },
    },
    {
        type: 'array',
        is: function isArray(entity: unknown): boolean {
            return entity instanceof Array;
        },
        iterator: function arrayIterator(array: unknown[], callback: TIteratorCallback): void {
            for (let i = 0; i !== array.length; i++) {
                callback(array[i], i);
            }
        },
    },
    {
        type: 'object',
        is: function isObject(entity: unknown): boolean {
            return ObjectUtils.isPlainObject(entity);
        },
        iterator: function objectIterator(
            object: Record<string, unknown>,
            callback: TIteratorCallback
        ): void {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    callback(object[key], key);
                }
            }
        },
    },
    {
        type: 'int',
        is: function isInt(entity: unknown): boolean {
            return parseInt(entity as string, 10) === entity;
        },
        iterator: function intIterator(value: number, callback: TIteratorCallback): void {
            for (let i = 0; i < value; i++) {
                callback(i, i);
            }
        },
    },
];

function getIterator(entity: unknown): TIterator | undefined {
    for (const it of iterators) {
        if (it.is(entity)) {
            return it.iterator as TIterator;
        }
    }

    return undefined;
}

var decorators;
function getDecorators() {
    if (decorators) {
        return decorators;
    } else {
        decorators = require('View/decorators');
        return decorators;
    }
}

function updateObject(obj, templateName, isWasabyTemplate) {
    Object.defineProperty(obj, 'isDataArray', {
        value: true,
        configurable: true,
        enumerable: false,
        writable: true,
    });
    Object.defineProperty(obj, 'isWasabyTemplate', {
        value: !!isWasabyTemplate,
        configurable: true,
        enumerable: false,
        writable: true,
    });
    Object.defineProperty(obj, 'toString', {
        value: function () {
            Logger.templateError(
                'Использование контентной опции компонента или шаблона в качестве строки. ' +
                    'Необходимо использовать контентные опции с помощью конструкции ws:partial или ' +
                    'обратитесь в отдел Инфраструктура представления',
                templateName
            );
            return this.join('');
        },
        configurable: true,
        enumerable: false,
        writable: true,
    });
}

let generatorCompatible;
let disableCompatForMarkupDecorator;
// специальный флаг для того, чтобы декоратор мог построить верстку на правильном несовместимом генераторе,
// дело в том, что его построение верстки декоратора может вызваться на сервере до того,
// как инициализируется флаг совместимости, если прикладники считают конфиг на роутинге до запуска построения страницы
// https://online.sbis.ru/opendoc.html?guid=9108459a-bd21-48cb-8c1a-1d847e29f33a
export function setDisableCompatForMarkupDecorator(value: boolean) {
    disableCompatForMarkupDecorator = value;
}
export function getDisableCompatForMarkupDecorator(): boolean {
    return disableCompatForMarkupDecorator;
}
export function getIfNeedGeneratorCompatible(forceCompatible: boolean, config) {
    if (
        disableCompatForMarkupDecorator ||
        Common.disableCompat() ||
        (!Common.isCompat() && !forceCompatible)
    ) {
        return false;
    }
    if (generatorCompatible && generatorCompatible.generatorConfig === config) {
        return generatorCompatible;
    }
    if (require.defined('View/ExecutorCompatible')) {
        generatorCompatible = require('View/ExecutorCompatible').Compatible(config);
        return generatorCompatible;
    } else {
        // FIXME: сейчас на СП всегда стоит флаг совместимости
        // Logger.warn('View/ExecutorCompatible не загружен. Проверьте загрузку слоя совместимости.');
        return false;
    }
}

export function needGeneratorCompatible(forceCompatible: boolean, config) {}

function isObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function setUnreachablePathFlag(obj: object): object {
    Object.defineProperty(obj, '__UNREACHABLE_GETTER_PATH__', {
        value: true,
        writable: true,
        enumerable: true,
        configurable: true,
    });
    return obj;
}

/**
 * Безопасный вызов функций для internal выражений.
 * Выполняется проверка, что вызываемая функция является функцией, а аргументы функции не undefined.
 * @param fn Вызываемая internal функция.
 * @param ctx Контекст функции.
 * @param args Аргументы функции.
 * @param collection FIXME В случае невозможности вызова функции генерируется исключение.
 */
function callIFun(fn: Function, ctx: object, args: unknown[], collection: object): unknown {
    // Эта проверка используется для проброса переменных из замыкания(dirtyCheckingVars)
    // Значения переменных из замыкания вычисляются в момент создания контентной опции
    // и пробрасываются через все контролы, оборачивающие контент.
    // Если в замыкании используется функция, в какой-то момент этой функции может не оказаться,
    // мы попытаемся ее вызвать и упадем с TypeError
    // Поэтому нужно проверить ее наличие. Кроме того, нужно проверить, что аргументы этой функции,
    // если такие есть, тоже не равны undefined, иначе может случиться TypeError внутри функции
    // Изначально здесь была проверка без !== undefined. Но такая проверка некорректно работала
    // в случае, если одно из проверяемых значения было рано 0, например.
    // Вообще этой проверки быть не должно. От нее можно избавиться,
    // если не пробрасывать dirtyCheckingVars там, где это не нужно.
    if (typeof fn !== 'function') {
        if (collection) {
            setUnreachablePathFlag(collection);
        }
        return undefined;
    }
    if (args.some((arg) => typeof arg === 'undefined')) {
        // Мы не вызываем функцию, потому что получили невалидный аргумент, а значит
        // вычисление происходит в неверном контексте. Необходимо проставить флаг,
        // чтобы перерисовка происходила принудительно.
        if (collection) {
            setUnreachablePathFlag(collection);
        }
        return undefined;
    }
    return fn.apply(ctx, args);
}

var lastGetterPath;

function isImplementsIObject(obj: unknown): boolean {
    const type = typeof obj;

    return (
        (type === 'object' || type === 'function') && '[Types/_entity/IObject]' in (obj as object)
    );
}

// чтобы в шаблонах можно было получать DEFAULT_BREAKPOINTS откуда угодно, ничего лишний раз не инициализируя
// бывает сложно прокинуть опцию через несколько слоев и шаблонов через другие отделы
// (и вообще разобраться как все устроено)
const DEFAULT_BREAKPOINTS = {
    xs: 375,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};
// TODO: https://online.sbis.ru/opendoc.html?guid=cb4dab25-e455-4be7-896f-e8082a4d64ed
function extractValue<T>(obj: unknown, path: string[]): T {
    let result: unknown = obj;
    let i: number;

    for (i = 0; i < path.length; i++) {
        if (result === undefined || result === null) {
            return undefined;
        }

        const name = path[i];
        if (isImplementsIObject(result) && (result as IObject).has(name)) {
            result = (result as IObject).get(name);
        } else if (result[name]) {
            result = result[name];
        } else if (name === 'DEFAULT_BREAKPOINTS') {
            result = DEFAULT_BREAKPOINTS;
        } else if (name !== '_options') {
            /**
             * if we want get "_options" field
             * we maybe want all fields from current scope
             * It is actual for stateless wml files
             */
            result = result[name];
        }
    }

    if (i !== path.length) {
        throw new Error(`Evaluation error. Path ${path.join('.')} is not reachable`);
    }

    return result as T;
}

var getter = function getter(obj, path, collection) {
        let result;

        lastGetterPath = path;

        try {
            result = extractValue(obj, path);
        } catch {
            if (collection) {
                setUnreachablePathFlag(collection);
            }
        }

        return result;
    },
    /**
     * Set name property on object to value.
     *
     * @param obj
     * @param path
     * @param value
     */
    setter = function setter(obj, path, value) {
        if (path[0] === 'record' && obj?.props?.record?.has(path[1])) {
            // todo костыль,
            //  есть конкретная ситуация, когда в wml-шаблон вставляемый через partial передают record
            //  и в шаблоне делают bind:selectedKey="record.SalaryTypeExtended"
            //  бинды применяются на реф. то есть когда элемент создается. но если в шаблон передадут новый
            //  record, в который нужно будет записывать измененные внутри данные, а элемент при этом
            //  останется прежним, реф не стрельнет, и бинд не узнает про новый record, будет писать в старый.
            //  в бинде причем есть попытка сначала записать в родительский контрол viewController, а если
            //  не получилось, тогда уж записывать в объект скоупа который сформирован для шаблона.
            //  В ошибке в родительском контроле мы не находим record, данные записывюатся в скоуп, где старый record.
            //  Поэтому, поищем еще в пропах родительского контрола, там то новый рекорд как раз найдется.
            return object.implantValue(obj.props, path, value);
        }
        return object.implantValue(obj, path, value);
    },
    wrapUndef = function wrapUndef(value) {
        if (value === undefined || value === null) {
            return '';
        } else {
            if (checkPinTypes(value)) {
                return pinTypes[value._moduleName](value);
            }
            return value;
        }
    },
    getTypeFunction = function (name, arg) {
        var res = Serializer.getFuncFromDeclaration(name ? name.trim() : name);
        if (typeof res === 'function' && Object.keys(arg).length) {
            res = res.bind(undefined, arg);
        }
        if (typeof res !== 'function') {
            Logger.error(
                `Function "${name}" has not been loaded yet! Add this function to the module definition`
            );
        }
        return res;
    },
    enumTypePin = function typeEnum(value) {
        return String(value);
    },
    // Коллекция типов для которых нужен особый вывод
    pinTypes = {
        'Types/collection:Enum': enumTypePin,
        'Data/collection:Enum': enumTypePin,
        'Data/_collection/Enum': enumTypePin,
        'WS.Data/Type/Enum': enumTypePin,
    },
    checkPinTypes = function checkPinTypes(value) {
        return value && value._moduleName && pinTypes.hasOwnProperty(value._moduleName);
    },
    // при scope="{{_options}}" нельзя прокидывать name, forwardedRef, _$createdFromCode пришедшие из _options (от родителя)
    notForwardableOptions = ['name', 'forwardedRef', '$wasabyRef', '_$createdFromCode'],
    isForwardableOption = function (optionName) {
        return !notForwardableOptions.includes(optionName);
    },
    filterOptions = function (scope) {
        // TODO: покрыть тестами, нет юнитов
        var filteredScope = {};

        if (!isObject(scope)) {
            return scope;
        }

        // Only keep options that are forwardable. Do not forward ones that
        // identify a specific instance, for example `name`
        for (var key in scope) {
            if (isForwardableOption(key)) {
                filteredScope[key] = scope[key];
            }
        }

        return filteredScope;
    },
    templateError = function error(filename, e, data) {
        if (lastGetterPath && e.message.indexOf('apply') > -1) {
            e = new Error(
                'Field ' + lastGetterPath.toString().replace(/,/g, '.') + ' is not a function!'
            );
        }

        Logger.templateError('Failed to generate html', filename, data, e);
    },
    partialError = function partialError() {
        try {
            if (typeof window !== 'undefined') {
                // явно указываем откуда ошибка, чтобы понять откуда начинать отладку в случае проблем
                throw new Error('[UICore/Executor/TClosure:partialError()]');
            }
        } catch (err) {
            Logger.error(
                'Использование функции в качестве строковой переменной! Необходимо обернуть в тег ws:partial',
                null,
                err
            );
        }
    },
    makeFunctionSerializable = function makeFunctionSerializable(func, scope) {
        var funcStr = '';
        if (typeof window === 'undefined') {
            funcStr = func.toString();
        }
        func = func.bind(scope);
        func.toStringOrigin = func.toString;
        func.toString = function () {
            if (typeof window === 'undefined' && funcStr.indexOf('createControl') > -1) {
                partialError();
            }
            return func(this);
        }.bind(scope);

        if (typeof window === 'undefined') {
            func.toJSON = function () {
                return 'TEMPLATEFUNCTOJSON=' + funcStr;
            };
        }
        return func;
    },
    // Пока не избавимся от всех использований concat для массивных опций
    // нужно вещать toString на них
    createDataArray = function createDataArray(array, templateName, isWasabyTemplate, isVdom) {
        updateObject(array, templateName, isWasabyTemplate);
        if (!array.length || !array[0]) {
            return array;
        }
        if (!(array[0].internal && isVdom === true)) {
            return array;
        }
        // todo добавить еще прокидывание других аргументов
        const out = function (props, attr, context) {
            return <out.array {...props} {...attr} context={context} />;
        };
        out.array = array;
        updateObject(out, templateName, isWasabyTemplate);
        return out;
    },
    // Существует пока есть второй прогон dot на препроцессоре
    sanitizeContent = function sanitizeContent(content) {
        var Sanitize = require('Core/Sanitize');
        var opts = getDecorators()._sanitizeOpts();

        // экранируем скобки только если код выполняется в сервисе представления, только там может dot дважды эскейпиться
        if (typeof process !== 'undefined' && !process.versions) {
            content = Common.escapeParenthesis(content);
        }

        return Sanitize(content, opts);
    },
    // Ключи виртуальных нод могут переопределяться пользователем
    // Мы должны проверить тип и значение ключа.
    // Одно из требований должно выполняться:
    // * ключ является непустой строкой,
    // * ключ является конечным числом
    validateNodeKey = function validateNodeKey(key): number | string {
        if (key || key === 0) {
            return key;
        }
        // Вернемся к валидации ключей позднее
        // if (typeof key === 'string' && key || typeof key === 'number' && isFinite(key)) {
        //    return key;
        // }
        // if (isArray(key) && key.length > 0) {
        //    return key.map(value => `${value}`).toString();
        // }
        return '_';
    },
    getRk = function (fileName) {
        var localizationModule = fileName.split('/')[0];
        this.getRkCache = this.getRkCache || {};
        var rk = this.getRkCache[localizationModule] || requirejs('i18n!' + localizationModule);
        this.getRkCache[localizationModule] = rk;
        return rk;
    },
    /**
     * при построении шаблонов (инлайн шаблоны, контентные опции) контекстом выполнения является не контрол
     * а производная шаблона (object.create), но в вызываемые внутри функции нужно передавать в качестве
     * контекста выполнения нужно передавать сам контрол. Функция вычисляет этот контрол.
     * @param obj
     */
    getContext = function (obj) {
        let result = obj;
        while (result) {
            // маркером того, что мы нашли контрол является поле _container
            if (result.hasOwnProperty('_container')) {
                return result;
            }
            result = result.__proto__;
        }
        return obj;
    };

const isolateScope = Scope.isolateScope;
const createScope = Scope.createScope;
const presetScope = Scope.presetScope;
const uniteScope = Scope.uniteScope;
const calcParent = ConfigResolver.calcParent;
const plainMerge = Common.plainMerge;
const plainMergeAttr = Common.plainMergeAttr;
const plainMergeContext = Common.plainMergeContext;
const _isTClosure = true;

export {
    callIFun,
    setUnreachablePathFlag,
    isolateScope,
    createScope,
    presetScope,
    uniteScope,
    createDataArray,
    filterOptions,
    calcParent,
    wrapUndef,
    getDecorators,
    sanitizeContent as Sanitize,
    iterators,
    getIterator,
    templateError,
    partialError,
    makeFunctionSerializable,
    getter,
    setter,
    plainMerge,
    plainMergeAttr,
    plainMergeContext,
    getTypeFunction as getTypeFunc,
    validateNodeKey,
    getRk,
    getContext,
    _isTClosure,
};
