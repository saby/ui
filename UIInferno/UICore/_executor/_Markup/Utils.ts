/// <amd-module name="UICore/_executor/_Markup/Utils" />
/* tslint:disable */

import * as Decorate from '../_Expressions/Decorate';
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
   INodeAttribute,
   TObject
} from 'UICommon/Executor';

import { NumberUtils } from 'UICommon/Utils';
import { TemplateFunction } from 'UICommon/Base';
import { CreateTag } from './Component';

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

/**
 * Понимаем асинхронная ветка или нет
 * @param entity
 * @returns {unknown}
 */
export function isInstOfPromise(entity: Promise<any>): unknown {
   return entity && entity.then;
}

/**
 * Создаем строку с тегом для повторного выполнения
 * _beforeMount на клиенте и обработки ошибок
 * @param inst
 * @param createTag
 * @returns {string}
 */
export function asyncRenderErrorTag(inst: TObject, createTag?: Function): string {
   let decoratorObject = {};
   let options;
   if (inst && inst._options) {
      options = inst._options;
      decoratorObject = Decorate.createRootDecoratorObject(
         options.__$config,
         true,
         options['data-component'],
         {}
      );
   }
   const createTagFn = createTag ? createTag : new CreateTag().create;
   return createTagFn('div', { attributes: decoratorObject }, []);
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
