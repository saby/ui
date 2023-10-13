/**
 * @author Krylov M.A.
 *
 * Модуль однобуквенных алиасов для публичных модулей и сущностей.
 * Используется в генерации кода шаблонов в режиме релиза.
 */

export declare type TAliasesMap = Map<string, string>;

/**
 * Generate aliases map from its full name into short name.
 *
 * @param {Record<string, string>} object Dictionary.
 */
function generateAliases(object: Record<string, string>): TAliasesMap {
    const map = new Map<string, string>();

    Object.keys(object).forEach((property: string) => {
        map.set(object[property], property);
    });

    return map;
}

/**
 * Release mode aliases for conditional chain.
 */
export const CHAIN_ALIASES: TAliasesMap = generateAliases({
    i: 'elif',
    e: 'else',
    f: 'fi',
});

/**
 * Release mode aliases for entry point module.
 */
export const ENTRY_POINT_ALIASES: TAliasesMap = generateAliases({
    g: 'generate',
    d: 'wrapDependencies',
    c: 'wrapContentBody',
    t: 'wrapTemplateBody',
    r: 'wrapRootBody',
});

/**
 * Release mode aliases for generator.
 */
export const GENERATOR_ALIASES: TAliasesMap = generateAliases({
    e: 'escape',
    t: 'createText',
    d: 'createDirective',
    c: 'createComment',
    g: 'createTag',
    C: 'createControl',
    P: 'createPartial',
    T: 'createTemplate',
    I: 'createInline',
    D: 'evalDefaultScope',
    s: 'evalOptionsScope',
    S: 'evalScope',
    m: 'evalExpression',
    M: 'closeExpression',
    B: 'closeBindExpression',
    o: 'createContentOption',
    O: 'evalContentOption',
    F: 'createFunction',
    i: 'if',
    r: 'for',
    h: 'foreach',
});

/**
 * Release mode aliases for methods.
 */
export const METHODS_ALIASES: TAliasesMap = generateAliases({
    t: 'sanitize',
    u: 'wrapUndefined',
    S: 'wrapString',
    g: 'getter',
    s: 'setter',
    d: 'decorate',
    c: 'call',
    C: 'call2',
    r: 'getResourceURL',
    D: 'dots'
});

export default {
    CHAIN_ALIASES,
    ENTRY_POINT_ALIASES,
    GENERATOR_ALIASES,
    METHODS_ALIASES
};
