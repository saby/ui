/**
 * @description Common code generation methods.
 * @author Крылов М.А.
 */

import * as Ast from 'Compiler/core/Ast';

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
 */
export function createConfigNew(
   compositeAttributes: string,
   scope: string,
   context: string,
   internal: string,
   isRootTag: boolean,
   key: string,
   mergeType: string,
   blockOptionNames: string[]
): string {
   return `{`
      + `attr: attr,`
      + `data: data,`
      + `ctx: this,`
      + `isVdom: isVdom,`
      + `defCollection: defCollection,`
      + `depsLocal: typeof depsLocal !== 'undefined' ? depsLocal : {},`
      + `includedTemplates: includedTemplates,`
      + `pName: typeof currentPropertyName !== 'undefined' ? currentPropertyName : undefined,`
      + `viewController: viewController,`
      + `context: ${context},`
      + `compositeAttributes: ${compositeAttributes},`
      + `scope: ${scope},`
      + `key: key + "${key}",`
      + `isRootTag: ${isRootTag},`
      + (internal ? `internal: isVdom ? ${internal} : {},` : '')
      + `mergeType: "${mergeType}",`
      + `blockOptionNames: ${JSON.stringify(blockOptionNames)}`
      + `}`;
}
