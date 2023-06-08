/**
 * @description Common code generation methods.
 */

import * as Ast from '../../_core/Ast';

const EMPTY_STRING = '';
const EMPTY_OBJECT = '{}';

/**
 * Generate object property for internal.
 * @param internal {string} Internal block value.
 */
function generateInternal(internal: string): string {
    if (!internal) {
        return EMPTY_STRING;
    }

    const value =
        internal === EMPTY_OBJECT
            ? internal
            : `shouldCalculateInternal ? ${internal} : ${EMPTY_OBJECT}`;

    return `internal: ${value},`;
}

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
 * @param isContainerNode {boolean} Container node flag.
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
    isContainerNode: boolean
): string {
    const depsLocalValue = aotMode
        ? 'depsLocal'
        : 'typeof depsLocal !== "undefined" ? depsLocal : {}';

    return (
        '{' +
        'attr: attr,' +
        'data: data,' +
        'ctx: this,' +
        'isVdom: isVdom,' +
        'defCollection: defCollection,' +
        `depsLocal: ${depsLocalValue},` +
        'includedTemplates: includedTemplates,' +
        'viewController: viewController,' +
        `context: ${context},` +
        `key: key + "${key}",` +
        '/*#CONFIG__CURRENT_PROPERTY_NAME#*/' /* pName: value */ +
        (compositeAttributes
            ? `compositeAttributes: ${compositeAttributes},`
            : EMPTY_STRING) +
        (scope ? `scope: ${scope},` : EMPTY_STRING) +
        (isRootTag ? `isRootTag: ${isRootTag},` : EMPTY_STRING) +
        generateInternal(internal) +
        (mergeType !== 'context'
            ? `mergeType: "${mergeType}",`
            : EMPTY_STRING) +
        (blockOptionNames.length > 0
            ? `blockOptionNames: ${JSON.stringify(blockOptionNames)},`
            : EMPTY_STRING) +
        (isContainerNode
            ? 'isContainerNode: attr && attr.isControlTemplate,'
            : EMPTY_STRING) +
        '}'
    );
}
