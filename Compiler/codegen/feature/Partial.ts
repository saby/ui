/**
 * @description Common code generation methods.
 * @author Крылов М.А.
 */

import * as Ast from 'Compiler/core/Ast';

const EMPTY_STRING = '';

/**
 * Get dynamic component option names.
 * @param component {BaseWasabyElement} Component node.
 * @returns {string[]} Array of dynamic component option names.
 */
export function getBlockOptionNames(component: Ast.BaseWasabyElement): string[] {
   const names = [];
   for (const name in component.__$ws_options) {
      const option = component.__$ws_options[name];
      if (option.hasFlag(Ast.Flags.UNPACKED)) {
         // Игнорируем опции, которые были заданы на атрибуте тега компонента
         continue;
      }
      names.push(name);
   }
   return names;
}

/**
 * Generate component config.
 * @param compositeAttributes {string} [deprecated] composite attributes
 * @param scope {string} Scope object
 * @param context {string} Current context
 * @param internal {string} Internal collection
 * @param isRootTag {string} Root tag flag
 * @param key {string} Node key
 * @param mergeType {string} Context and attributes merge type
 * @param blockOptionNames {string[]} Array of dynamic component option names.
 * @param aotMode {boolean} AOT compilation.
 * @param useRef {boolean} Use ref property for react.
 */
export function createConfigNew(
   compositeAttributes: string,
   scope: string,
   context: string,
   internal: string,
   isRootTag: boolean,
   key: string,
   mergeType: string,
   blockOptionNames: string[],
   aotMode: boolean,
   useRef: boolean
): string {
   const depsLocalValue = aotMode ? "depsLocal" : "typeof depsLocal !== 'undefined' ? depsLocal : {}";
   return '{'
      + `attr: attr,`
      + `data: data,`
      + `ctx: this,`
      + `isVdom: isVdom,`
      + `defCollection: defCollection,`
      + `depsLocal: ${depsLocalValue},`
      + `includedTemplates: includedTemplates,`
      + `viewController: viewController,`
      + `context: ${context},`
      + `key: key + "${key}",`
      + ('/*#CONFIG__CURRENT_PROPERTY_NAME#*/' /* pName: value */)
      + (useRef ? 'ref: ref,' : EMPTY_STRING)
      + (compositeAttributes ? `compositeAttributes: ${compositeAttributes},` : EMPTY_STRING)
      + (scope ? `scope: ${scope},` : EMPTY_STRING)
      + (isRootTag ? `isRootTag: ${isRootTag},` : EMPTY_STRING)
      + (internal ? `internal: isVdom ? ${internal} : {},` : EMPTY_STRING)
      + (mergeType !== 'context' ? `mergeType: "${mergeType}",` : EMPTY_STRING)
      + (blockOptionNames.length > 0 ? `blockOptionNames: ${JSON.stringify(blockOptionNames)},` : EMPTY_STRING)
      + '}';
}
