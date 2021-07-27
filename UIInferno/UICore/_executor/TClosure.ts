import { getIfNeedGeneratorCompatible, IGenerator } from 'UICommon/Executor';
import { Text, Vdom } from './Markup';

export function createGenerator(isVdom, forceCompatible = false, config): IGenerator {
   if (isVdom) {
      return Vdom(config);
   }

   const Compatible = getIfNeedGeneratorCompatible(forceCompatible, config);
   if (Compatible) {
      return Compatible;
   }

   return Text(config);
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
   return fn.call(ctx, args);
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
