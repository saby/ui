/**
 * @author Krylov M.A.
 *
 * Основные константы, используемые для генерации кода.
 */

export const MUSTACHE_EXPRESSION_METHODS_PARAMETER = 'methods';
export const MUSTACHE_EXPRESSION_DATA_PARAMETER = 'data';
export const MUSTACHE_EXPRESSION_FUNC_CONTEXT_PARAMETER = 'funcContext';
export const MUSTACHE_EXPRESSION_CONTEXT_PARAMETER = 'context';
export const MUSTACHE_EXPRESSION_CHILDREN_PARAMETER = 'children';

/**
 * Default full list of mustache expression function parameters.
 */
export const MUSTACHE_EXPRESSION_PARAMETERS = [
    MUSTACHE_EXPRESSION_METHODS_PARAMETER,
    MUSTACHE_EXPRESSION_DATA_PARAMETER,
    MUSTACHE_EXPRESSION_FUNC_CONTEXT_PARAMETER,
    MUSTACHE_EXPRESSION_CONTEXT_PARAMETER,
    MUSTACHE_EXPRESSION_CHILDREN_PARAMETER
];

/**
 * Possible sources inside mustache expression.
 */
export const MUSTACHE_EXPRESSION_SOURCE = {
    data: MUSTACHE_EXPRESSION_DATA_PARAMETER,
    funcContext: MUSTACHE_EXPRESSION_FUNC_CONTEXT_PARAMETER,
    context: MUSTACHE_EXPRESSION_CONTEXT_PARAMETER,
    children: MUSTACHE_EXPRESSION_CHILDREN_PARAMETER,
    self: 'this'
};

export const TEMPLATE_BODY_GENERATOR_PARAMETER = 'generator';
export const TEMPLATE_BODY_CONTEXT_PARAMETER = 'context';

/**
 * Default full list of template body function parameters.
 */
export const TEMPLATE_FUNCTION_PARAMETERS = [
    TEMPLATE_BODY_GENERATOR_PARAMETER,
    TEMPLATE_BODY_CONTEXT_PARAMETER
];

/**
 * Entry point identifier name.
 * Must be loaded at top of the template module.
 */
export const ENTRY_POINT_IDENTIFIER = 'IR';

/**
 * Translation function name.
 * Must be loaded at top of the template module.
 */
export const TRANSLATION_FUNCTION = 'rk';

/**
 * Debug function name.
 * Must be declared at top of the template module.
 */
export const DEBUG_FUNCTION = 'debug';

/**
 * Identifier for in-body template checks.
 * Must be declared at top of the template module.
 */
export const IS_WINDOW_UNDEFINED_IDENTIFIER = 'isWindowUndefined';

/**
 * Identifier for string literals table.
 */
export const STRINGS_IDENTIFIER = 'Strings';

/**
 * Function for injection unescaped and unsanitized html content.
 */
export const SET_HTML_UNSAFE_FUNCTION = '__setHTMLUnsafe';

/**
 * Identifier for scope options.
 */
export const DEFAULT_SCOPE_IDENTIFIER = '...';

/**
 * Default content option name which name should not be generated.
 */
export const DEFAULT_CONTENT_BODY_NAME = 'content';
