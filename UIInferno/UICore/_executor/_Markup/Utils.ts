/// <amd-module name="UICore/_executor/_Markup/Utils" />
/* tslint:disable */

import { IControl } from 'UICommon/interfaces';
import type { Control } from 'UICore/Base';
import {
   GeneratorError,
   GeneratorStringArray,
   CommonUtils as Common,
   invisibleNodeTagName,
   IGeneratorConfig,
   IGeneratorDefCollection,
   TAttributes,
   INodeAttribute
} from 'UICommon/Executor';

import { NumberUtils } from 'UICommon/Utils';
import { TemplateFunction } from 'UICommon/Base';

/**
 * @author Тэн В.А.
 */

interface IControlData {
   name?: unknown;
}

const invisibleNodeRegExp = new RegExp(invisibleNodeTagName, 'g');
const invisibleNodeHTML = '<' + invisibleNodeTagName + '></' + invisibleNodeTagName + '>';
export { invisibleNodeHTML };
// joinAttrs = Attr.joinAttrs;

const focusAttrs = [
   'ws-creates-context',
   'ws-delegates-tabfocus',
   'ws-tab-cycling',
   'ws-no-focus',
   'attr:ws-creates-context',
   'attr:ws-delegates-tabfocus',
   'attr:ws-tab-cycling',
   'attr:ws-no-focus'
];


/**
 * Понимаем асинхронная ветка или нет
 * @param entity
 * @returns {unknown}
 */
export function isInstOfPromise(entity: Promise<any>): unknown {
   return entity && entity.then;
}

/**
 *
 * @param markup
 * @returns {string}
 */
export function invisibleNodeCompat(markup: string): string {
   return markup && markup.indexOf && markup.indexOf(invisibleNodeHTML) === 0 ?
      markup.replace(invisibleNodeRegExp, 'div') : markup;
}

/**
 * Рекуриснове объединение элементов, если пришел массив из partial
 * @param elements
 * @param key
 * @param defCollection
 * @return {Array<object | string> | string | Error}
 */
export function joinElements(elements: Array<unknown>,
                             key?: string,
                             defCollection?: IGeneratorDefCollection): GeneratorStringArray | GeneratorError {
   if (Array.isArray(elements)) {
      let res = '';
      elements.forEach(function joinOneElement(element) {
         let id;
         if (Array.isArray(element)) {
            element = joinElements(element, undefined, defCollection);
         }
         if (element && isInstOfPromise(element)) {
            id = NumberUtils.randomId('def-');
            if (!defCollection.def) {
               defCollection.def = [];
            }
            defCollection.def.push(element);
            element = '[' + id + ']';
            defCollection.id.push(element);
         }
         res += (element || '');
      });

      return res;
   } else {
      throw new Error('joinElements: elements is not array');
   }
}

export function resolveControlName<TOptions extends IControlData>(controlData: TOptions,
                                                                  attributes: TAttributes | INodeAttribute): TAttributes | INodeAttribute {
   const attr = attributes || {};
   if (controlData && controlData.name) {
      attr.name = controlData.name;
   } else {
      if (attributes && attributes.name) {
         controlData.name = attributes.name;
      }
   }
   return attr;
}

/**
 * Если существует другой разрешатель имен в config.js. Мы его найдем и используем для подключения.
 * @param tpl
 * @param includedTemplates
 * @param _deps
 * @param config
 * @param parent
 * @returns {*}
 */
export function stringTemplateResolver<T = IControl, K = TemplateFunction>(tpl: string,
                                       includedTemplates: Common.IncludedTemplates<K>,
                                       _deps: Common.Deps<T, K>,
                                       config: IGeneratorConfig,
                                       parent?: IControl): T | K | Common.IDefaultExport<T> {
   const resolver = config && config.resolvers ? Common.findResolverInConfig(tpl, config.resolvers) : undefined;
   if (resolver) {
      return resolver(tpl);
   } else {
      return Common.depsTemplateResolver<T, K>(tpl, includedTemplates, _deps);
   }
}

/**
 * Скрывает атрибуты необходимые для работы системы фокусов
 * @param attributes
 * @param fn
 * @param node
 * @return {object}
 */
export function cutFocusAttributes(attributes: TAttributes, fn?: Function, node?: HTMLElement): void {
   focusAttrs.forEach((focusAttr: string): void => {
      if (attributes.hasOwnProperty(focusAttr)) {
         fn && fn(focusAttr, attributes[focusAttr]);
         delete attributes[focusAttr];
         if (node) {
            node.removeAttribute(focusAttr);
         }
      }
   });
}
