/**
 * @description Common code generation methods.
 */

import * as Ast from '../../_core/Ast';
import { Generator } from '../ECMAScript';

const EMPTY_OBJECT = '{}';

/**
 * Get dynamic component option names.
 * @param component {BaseWasabyElement} Component node.
 * @returns {string[]} Array of dynamic component option names.
 */
export function getBlockOptionNames(
    component: Ast.BaseWasabyElement
): string[] {
    const names = [];
    // eslint-disable-next-line guard-for-in
    for (const name in component.wsOptions) {
        const option = component.wsOptions[name];
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
 * @param isContainerNode {boolean} Container node flag.
 * @param generator {Generator} JavaScript code generator.
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
    isContainerNode: boolean,
    generator: Generator
): string {
    const depsLocalProperty = generator.genDynamicObjectProperty('depsLocal');
    const compositeAttributesProperty = generator.genDynamicObjectProperty('compositeAttributes');
    const scopeProperty = generator.genDynamicObjectProperty('scope');
    const isRootTagProperty = generator.genDynamicObjectProperty('isRootTag');
    const internalProperty = generator.genDynamicObjectProperty('internal');
    const mergeTypeProperty = generator.genDynamicObjectProperty('mergeType');
    const blockOptionNamesProperty = generator.genDynamicObjectProperty('blockOptionNames');
    const isContainerNodeProperty = generator.genDynamicObjectProperty('isContainerNode');

    const partialConfig: { [p: string]: unknown } = {
        [generator.genDynamicObjectProperty('attr')]: 'attr',
        [generator.genDynamicObjectProperty('data')]: 'data',
        ctx: 'this',
        [generator.genDynamicObjectProperty('isVdom')]: 'isVdom',
        [generator.genDynamicObjectProperty('defCollection')]: 'defCollection',
        [depsLocalProperty]: 'typeof depsLocal !== "undefined" ? depsLocal : {}',
        [generator.genDynamicObjectProperty('includedTemplates')]: 'includedTemplates',
        [generator.genDynamicObjectProperty('viewController')]: 'viewController',
        [generator.genDynamicObjectProperty('context')]: context,
        key: generator.genStringInterpolation(`\${key}${key}`),
        '/*#CONFIG__CURRENT_PROPERTY_NAME#*/': undefined,
        [compositeAttributesProperty]: undefined,
        [scopeProperty]: undefined,
        [isRootTagProperty]: undefined,
        [internalProperty]: undefined,
        [mergeTypeProperty]: undefined,
        [blockOptionNamesProperty]: undefined,
        [isContainerNodeProperty]: undefined
    };

    if (aotMode) {
        partialConfig[depsLocalProperty] = 'depsLocal';
    }

    if (compositeAttributes) {
        partialConfig[generator.genDynamicObjectProperty('compositeAttributes')] = compositeAttributes;
    }

    if (scope) {
        partialConfig[scopeProperty] = scope;
    }

    if (isRootTag) {
        partialConfig[isRootTagProperty] = isRootTag;
    }

    if (internal) {
        partialConfig[internalProperty] = (
            internal === EMPTY_OBJECT
                ? internal
                : `shouldCalculateInternal ? ${internal} : ${EMPTY_OBJECT}`
        );
    }

    if (mergeType !== 'context') {
        partialConfig[mergeTypeProperty] = `"${mergeType}"`;
    }

    if (blockOptionNames.length > 0) {
        partialConfig[blockOptionNamesProperty] = JSON.stringify(blockOptionNames);
    }

    if (isContainerNode) {
        partialConfig[isContainerNodeProperty] = generator.genOptionalChaining('attr?.isControlTemplate');
    }

    return generator.genObject(partialConfig);
}
