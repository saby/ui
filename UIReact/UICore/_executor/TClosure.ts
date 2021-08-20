import { Text, Vdom } from './Markup';
import { Logger } from 'UICommon/Utils';
import { Fragment, createElement } from 'react';

import { CommonUtils as Common } from 'UICommon/Executor';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';

let generatorCompatible;
function getIfNeedGeneratorCompatible(forceCompatible: boolean, config) {
   if (Common.disableCompat() || (!Common.isCompat() && !forceCompatible)) {
      return false;
   }
   if (generatorCompatible && generatorCompatible.generatorConfig === config) {
      return generatorCompatible;
   }
   if (ModulesLoader.isLoaded('View/ExecutorCompatible')) {
      // eslint-disable-next-line
      generatorCompatible = ModulesLoader.loadSync('View/ExecutorCompatible').CompatibleReact(config);
      return generatorCompatible;
   } else {
      // FIXME: сейчас на СП всегда стоит флаг совместимости
      // Logger.warn('View/ExecutorCompatible не загружен. Проверьте загрузку слоя совместимости.');
      return false;
   }
}

export function createGenerator(isVdom, forceCompatible = false, config) {
   const Compatible = getIfNeedGeneratorCompatible(forceCompatible, config);
   // если передали флаг isVdom=true надо использовать именно vdom генератор
   if (Compatible && !isVdom) {
      return Compatible;
   }
   if (isVdom) {
      return Vdom(config);
   }
   return Text(config);
}

export function createDataArrayReact(array, templateName, isWasabyTemplate) {
   let result;
   if (array.length === 1) {
      result = array[0];
   } else {
      result = (props) => createElement(Fragment, {
         children: array.map((child) => child(props))
      });
   }
   Object.defineProperty(result, 'isDataArray', {
      value: true,
      configurable: true,
      enumerable: false,
      writable: true
   });
   Object.defineProperty(result, 'isWasabyTemplate', {
      value: !!isWasabyTemplate,
      configurable: true,
      enumerable: false,
      writable: true
   });
   Object.defineProperty(result, 'toString', {
      value(): string {
         Logger.templateError(
             'Использование контентной опции компонента или шаблона в качестве строки. ' +
             'Необходимо использовать контентные опции с помощью конструкции ws:partial или ' +
             'обратитесь в отдел Инфраструктура представления', templateName);
         return this.join('');
      },
      configurable: true,
      enumerable: false,
      writable: true
   });

   return result;
}

/**
 * Безопасный вызов функций для internal выражений.
 * Выполняется проверка, что вызываемая функция является функцией, а аргументы функции не undefined.
 * @param fn Вызываемая internal функция.
 * @param ctx Контекст функции.
 * @param args Аргументы функции.
 */
export function callIFun(fn: Function, ctx: object, args: unknown[]): unknown {
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
      return undefined;
   }
   if (args.some(arg => typeof arg === 'undefined')) {
      return undefined;
   }
   return fn.apply(ctx, args);
}

type TRefFuncArgs = [props: Record<string, unknown> | object, ref: object | null];
type TUnpuckWMLArgs = [data: Record<string, unknown> | object, attr: object, context: unknown,
    isVdom: boolean | undefined, sets?: unknown, forceCompatible?: unknown, generatorConfig?: unknown];

const packedAttrs = '__$$packedAttrs';
const prefixAttrs = '__$$attrs_';
const prefixContext = '__$$context_';
const prefixIsVdom = '__$$isvdom';
const prefixSets = '__$$sets_';
const prefixforceCompatible = '__$$forcecompatible';
const prefixGeneratorConfig = '__$$generatorconfig_';

type TPackedArgs = Record<string, unknown> & { [packedAttrs]: Record<string, string[]> } & { [prefixIsVdom]: boolean | undefined };

function packObject(target: TPackedArgs, source: Record<string, unknown>, prefix: string, key: string): void {
    target[prefix + key] = source[key];
    target[packedAttrs][prefix] = (target[packedAttrs][prefix] || []);
    target[packedAttrs][prefix].push(key);
}

function unpackObject(source: TPackedArgs, prefix: string) {
    const founded = source[packedAttrs][prefix];
    if (!founded) {
        return undefined;
    }

    const result: Record<string, unknown> = {};
    founded.forEach?.((key: string) => {
        result[key] = source[prefix + key];
    });
    return result;
}

export function packTemplateAttrs(...args: TUnpuckWMLArgs): TRefFuncArgs {
    const NullRef = null;
    const NonReactAttrCount = 5;
    let isPacked = true;
    for (let i = 2; i <= NonReactAttrCount && isPacked; i++) {
        isPacked = args[i] === undefined;
    }

    if (isPacked) {
        return [
            args[0], args[1]
        ];
    }

    const [data, attr, context, isVdom, sets, forceCompatible, generatorConfig] = args;
    data[packedAttrs] = packedAttrs[packedAttrs] || {};

    Object.keys(attr).forEach(packObject.bind(null, data, attr, prefixAttrs));
    if (context) {
        Object.keys(context).forEach(packObject.bind(null, data, context, prefixContext));
    }
    data[prefixIsVdom] = isVdom;
    if (sets) {
        Object.keys(sets).forEach(packObject.bind(null, data, sets, prefixSets));
    }
    data[prefixforceCompatible] = forceCompatible;
    if (generatorConfig) {
        Object.keys(generatorConfig).forEach(packObject.bind(null, data, generatorConfig, prefixGeneratorConfig));
    }

    let ref = NullRef;
    if ('ref' in data) {
        ref = data['ref'];
        delete data['ref'];
    }
    return [data, ref];
}

export function unpackTemplateAttrs(props: TPackedArgs, ref: object | null): TUnpuckWMLArgs {
    if (!(packedAttrs in props)) {
        return [props, ref, undefined, undefined, undefined, undefined, undefined];
    }

   if (ref) {
      props.ref = ref;
   }

    if (typeof props[packedAttrs] !== 'object') {
        return [props, {}, undefined, undefined, undefined, undefined, undefined];
    }

    const attr = unpackObject(props, prefixAttrs) || {};
    const context = unpackObject(props, prefixContext);
    const isVdom: boolean = props[prefixIsVdom];
    const sets = unpackObject(props, prefixIsVdom);
    const forceCompatible = props[prefixforceCompatible];
    const generatorConfig = unpackObject(props, prefixGeneratorConfig);

    return [props, attr, context, isVdom, sets, forceCompatible, generatorConfig];
}


export {
    isolateScope,
    createScope,
    presetScope,
    uniteScope,
    createDataArray,
    filterOptions,
    calcParent,
    wrapUndef,
    getDecorators,
    Sanitize,
    iterators,
    templateError,
    partialError,
    makeFunctionSerializable,
    getter,
    setter,
    config,
    processMergeAttributes,
    plainMerge,
    plainMergeAttr,
    plainMergeContext,
    getTypeFunc,
    validateNodeKey,
    getRk,
    getContext,
    _isTClosure
} from 'UICommon/Executor';
