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

export { createChangedInternal, callIFun } from 'UICommon/Executor';

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
