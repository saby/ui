/// <amd-module name="UICommon/_executor/TClosure" />
/* tslint:disable */

/**
 * @author Тэн В.А.
 */

// @ts-ignore
import { Serializer } from 'UICommon/State';
// @ts-ignore
import { Logger } from 'UICommon/Utils';
// @ts-ignore
import {Config as config} from 'UICommon/BuilderConfig';
// @ts-ignore
import { ObjectUtils } from 'UICommon/Utils';
import { object } from 'Types/util';
// @ts-ignore
import { constants } from 'Env/Env';
import * as Scope from './_Expressions/Scope';
import { Common, ConfigResolver } from './Utils';
import {IObject} from "Types/entity";

let decorators;
function getDecorators() {
   if (decorators) {
      return decorators;
   } else {
      // eslint-disable-next-line
      decorators = require('View/decorators');
      return decorators;
   }
}

let generatorCompatible;
export function getIfNeedGeneratorCompatible(forceCompatible: boolean, config) {
   if (Common.disableCompat() || (!Common.isCompat() && !forceCompatible)) {
      return false;
   }
   if (generatorCompatible && generatorCompatible.generatorConfig === config) {
      return generatorCompatible;
   }
   if (require.defined('View/ExecutorCompatible')) {
      // eslint-disable-next-line
      generatorCompatible = require('View/ExecutorCompatible').Compatible(config);
      return generatorCompatible;
   } else {
      // FIXME: сейчас на СП всегда стоит флаг совместимости
      // Logger.warn('View/ExecutorCompatible не загружен. Проверьте загрузку слоя совместимости.');
      return false;
   }
}

export function needGeneratorCompatible(forceCompatible: boolean, config) {

}

function isObject(obj: any): boolean {
   return Object.prototype.toString.call(obj) === '[object Object]';
}

const ITERATORS = [
   {
      type: 'recordset',
      is: function isRecordset(ent) {
         return ent && Object.prototype.toString.call(ent.each) === '[object Function]';
      },
      iterator: function recordsetIterator(recordset, callback) {
         recordset.each(callback);
      }
   },
   {
      type: 'array',
      is: function isArray(ent) {
         return ent instanceof Array;
      },
      iterator: function arrayIterator(array, callback) {
         let i, ln = array.length;
         for (i = 0; i !== ln; i++) {
            callback(array[i], i);
         }
      }
   },
   {
      type: 'object',
      is: function isObject(ent) {
         return ObjectUtils.isPlainObject(ent);
      },
      iterator: function objectIterator(object, callback) {
         for (const key in object) {
            if (object.hasOwnProperty(key)) {
               callback(object[key], key);
            }
         }
      }
   },
   {
      type: 'int',
      is: function isInt(n) { return parseInt(n) === n },
      iterator: function intIterator(number, callback) {
         for (let i = 0; i < number; i++) {
            callback(i, i);
         }
      }
   }
];

let lastGetterPath: string[];
function getter(obj: unknown, path: string[], isStrict?: boolean): unknown {
   lastGetterPath = path;
   if (!isStrict) {
      return object.extractValue(obj, path);
   }

   let lastDepth = -1;
   const result = object.extractValue(obj, path, (_, __, depth) => {
      lastDepth = depth;
   });

   if ((lastDepth !== path.length - 1) && result === undefined) {
      throw new Error(`Unreachable path ${path.join(',')}`);
   }

   return result;
}

function setUnreachablePathFlag(obj: object): object {
   Object.defineProperty(obj, '__UNREACHABLE_GETTER_PATH__', {
      value: true
   });

   return obj;
}

/**
 * Set name property on object to value.
 * @param obj
 * @param path
 * @param value
 */
function setter(obj, path, value) {
   return object.implantValue(obj, path, value);
}

function wrapUndef(value) {
   if (value === undefined || value === null) {
      return "";
   } else {
      if (checkPinTypes(value)) {
         return pinTypes[value._moduleName](value);
      }
      return value;
   }
}

function getTypeFunction(name, arg) {
   let res = Serializer.getFuncFromDeclaration(name ? name.trim() : name);
   if (typeof res === 'function' && Object.keys(arg).length) {
      res = res.bind(undefined, arg);
   }
   if (typeof res !== 'function') {
      Logger.error(`Function "${name}" has not been loaded yet! Add this function to the module definition`);
   }
   return res;
}

function enumTypePin(value) {
   return String(value);
}

// Коллекция типов для которых нужен особый вывод
const pinTypes = {
   'Types/collection:Enum': enumTypePin,
   'Data/collection:Enum': enumTypePin,
   'Data/_collection/Enum': enumTypePin,
   'WS.Data/Type/Enum': enumTypePin
};

function checkPinTypes(value) {
   return value && value._moduleName && pinTypes.hasOwnProperty(value._moduleName);
}

function isForwardableOption(optionName) {
   return optionName !== 'name';
}

function filterOptions(scope) {
   // TODO: покрыть тестами, нет юнитов
   const filteredScope = {};

   if (!isObject(scope)) {
      return scope;
   }

   // Only keep options that are forwardable. Do not forward ones that
   // identify a specific instance, for example `name`
   for (const key in scope) {
      if (isForwardableOption(key)) {
         filteredScope[key] = scope[key];
      }
   }

   return filteredScope;
}

function templateError(filename, e, data) {
   if (lastGetterPath && e.message.indexOf('apply') > -1) {
      e = new Error("Field " + lastGetterPath.toString().replace(/,/g, '.') + ' is not a function!');
   }

   Logger.templateError('Failed to generate html', filename, data, e);
}

function partialError() {
   try {
      if (typeof window !== 'undefined') {
         // явно указываем откуда ошибка, чтобы понять откуда начинать отладку в случае проблем
         throw new Error('[UICore/Executor/TClosure:partialError()]');
      }
   } catch (err) {
      Logger.error('Использование функции в качестве строковой переменной! Необходимо обернуть в тег ws:partial', null, err);
   }
}

function makeFunctionSerializable(func, scope) {
   let funcStr = '';
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
         return "TEMPLATEFUNCTOJSON=" + funcStr;
      };
   }
   return func;
}

// Пока не избавимся от всех использований concat для массивных опций
// нужно вещать toString на них
function createDataArray(array, templateName, isWasabyTemplate) {
   Object.defineProperty(array, 'isDataArray', {
      value: true,
      configurable: true,
      enumerable: false,
      writable: true
   });
   Object.defineProperty(array, 'isWasabyTemplate', {
      value: !!isWasabyTemplate,
      configurable: true,
      enumerable: false,
      writable: true
   });
   Object.defineProperty(array, 'toString', {
      value: function() {
         Logger.templateError(
             "Использование контентной опции компонента или шаблона в качестве строки. " +
             "Необходимо использовать контентные опции с помощью конструкции ws:partial или " +
             "обратитесь в отдел Инфраструктура представления", templateName);
         return this.join("");
      },
      configurable: true,
      enumerable: false,
      writable: true
   });

   return array;
}

// Существует пока есть второй прогон dot на препроцессоре
function sanitizeContent(content) {
   // @ts-ignore
   const Sanitize = require('Core/Sanitize');
   const opts = getDecorators()._sanitizeOpts();

   // экранируем скобки только если код выполняется в сервисе представления, только там может dot дважды эскейпиться
   // @ts-ignore
   if (typeof process !== 'undefined' && !process.versions) {
      content = Common.escapeParenthesis(content);
   }

   return Sanitize(content, opts);
}

// Ключи виртуальных нод могут переопределяться пользователем
// Мы должны проверить тип и значение ключа.
// Одно из требований должно выполняться:
// * ключ является непустой строкой,
// * ключ является конечным числом
function validateNodeKey(key): number | string {
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
}

function getRk(fileName) {
   const localizationModule = fileName.split('/')[0];
   this.getRkCache = this.getRkCache || {};
   const rk = this.getRkCache[localizationModule] || requirejs("i18n!" + localizationModule);
   this.getRkCache[localizationModule] = rk;
   return rk;
}

/**
 * при построении шаблонов (инлайн шаблоны, контентные опции) контекстом выполнения является не контрол
 * а производная шаблона (object.create), но в вызываемые внутри функции нужно передавать в качестве
 * контекста выполнения нужно передавать сам контрол. Функция вычисляет этот контрол.
 * @param obj
 */
function getContext(obj) {
   let result = obj;
   while (result) {
      // маркером того, что мы нашли контрол является поле _container
      if (result.hasOwnProperty('_container')) {
         return result;
      }
      result = result.__proto__;
   }
   return obj;
}

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
   ITERATORS as iterators,
   templateError,
   partialError,
   makeFunctionSerializable,
   getter,
   setter,
   config,
   plainMerge,
   plainMergeAttr,
   plainMergeContext,
   getTypeFunction as getTypeFunc,
   validateNodeKey,
   getRk,
   getContext,
   _isTClosure
};
