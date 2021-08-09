import { getIfNeedGeneratorCompatible } from 'UICommon/Executor';
import { Text, Vdom } from './Markup';
import { Logger } from 'UICommon/Utils';
import { Fragment, createElement, forwardRef, ForwardRefRenderFunction } from 'react';

// TODO: пока разруливаю так, но вообще генератор совместимости видимо будет ставить какие-то флаги
export function createGenerator(
    isVdom: boolean = typeof window !== 'undefined',
    forceCompatible: boolean = false,
    config?: object) {
   if (isVdom) {
      return Vdom(config);
   }

   const Compatible = getIfNeedGeneratorCompatible(forceCompatible, config);
   if (Compatible) {
      return Compatible;
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

export function createForwardRef(callback: ForwardRefRenderFunction<unknown>): any {
   return forwardRef(callback);
}

/**
 * Тот же самый createScope, что и раньше был для инферно, но с одним отличием:
 * Object.create заменён на Object.assign.
 * Сделано это из-за того, что реакт в опции кладёт только собственные свойства.
 */
export function createScope(scope: any): object {
   return Object.assign({}, scope && scope._getRawData ? scope._getRawData() : (scope || null));
}

export function getContext(scope: {
   _$wasabyInstance: unknown
}): unknown {
   return scope._$wasabyInstance;
}

export function calcParent(obj: any, currentPropertyName: any, data: any): any {
   if (obj && obj.viewController !== undefined) {
      return obj.viewController;
   }
   if (data && data._$wasabyInstance !== undefined) {
      return data._$wasabyInstance;
   }
   if (data && data._$wasabyParent !== undefined) {
      return data._$wasabyParent;
   }
   return undefined;
}

export {
   isolateScope,
   presetScope,
   uniteScope,
   createDataArray,
   filterOptions,
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
   _isTClosure
} from 'UICommon/Executor';
