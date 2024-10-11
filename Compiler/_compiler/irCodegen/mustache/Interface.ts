/**
 * @author Krylov M.A.
 */

import type { Node } from '../../expressions/Nodes';

/**
 * Interface of possible identifiers in mustache expression.
 *
 * @private
 */
export interface ISource {

    /**
     * Special identifier 'funcContext'
     */
    readonly funcContext: string;

    /**
     * Special identifier 'data'
     */
    readonly data: string;

    /**
     * Special identifier 'context'
     */
    readonly context: string;

    /**
     * Special identifier 'children'
     */
    readonly children: string;

    /**
     * Special identifier 'this'.
     */
    readonly self: string;
}

/**
 * @private
 */
export interface IFlags {

    /**
     * Mustache expression contains references to methods variable.
     * Perhaps expression contains only literal.
     */
    hasMethodsReference: boolean;

    /**
     * Mustache expression contains references to funcContext variable.
     */
    hasFuncContextReference: boolean;

    /**
     * Mustache expression contains references to context variable.
     */
    hasContextReference: boolean;

    /**
     * Mustache expression contains references to children variable.
     */
    hasChildrenReference: boolean;

    /**
     * Mustache expression contains references to this variable.
     * Compiling function cannot be arrow.
     */
    hasSelfReference: boolean;

    /**
     * Mustache expression contains debug function call. This function must be declared in module.
     */
    hasDebugReference: boolean;

    /**
     * Mustache expression contains usage of rk function. This function must be declared in module.
     */
    hasTranslationReference: boolean;

    /**
     * Check whether body property is function or literal.
     */
    isTableFunction(): boolean;
}

/**
 * Interface for meta information of mustache expression.
 *
 * @private
 */
export interface IMustacheMeta<TFunction> {

    /**
     * Flag which indicates whether body property is function or literal.
     */
    isTableFunction: boolean;

    /**
     * Content dependant flags.
     * Used for expressions with delayed compilation or when its context is undetermined.
     */
    flags?: IFlags;

    /**
     * Body of mustache expression.
     */
    body: TFunction;

    /**
     * String representation of original program content.
     */
    program?: string;

    /**
     * Body contains expressions which must be escaped.
     */
    shouldEscape?: boolean;
}

/**
 * Generator options.
 * Warning! Options mustn't be re-created during generate process.
 *
 * @private
 */
export interface IMustacheOptions {

    /**
     * Conditional operator might be without alternate part.
     * Provide default value to use in this case.
     * Default value is undefined.
     */
    defaultAlternateValue?: string;

    /**
     * Allow generating properties as identifiers if it's possible (valid identifier name).
     * Default value is true.
     */
    generateObjectPropertyAsIdentifier?: boolean;

    /**
     * Allow computed object properties.
     * Default value is true.
     */
    allowComputedObjectProperty?: boolean;

    /**
     * Remove unused function parameters.
     * Default value is true.
     */
    allowReducingFunctionParameters?: boolean;

    /**
     * Additional parameters to function.
     * Default value is empty array.
     */
    extraParameters?: string[];

    /**
     * Wrap mustache expression body with sanitize function.
     * Default value is false.
     */
    shouldSanitize?: boolean;

    /**
     * Wrap mustache expression body with function which tests the value for undefined value.
     * Default value is false.
     */
    shouldWrapUndefined?: boolean;

    /**
     * Wrap mustache expression body with escape function.
     * Default value is false.
     */
    shouldEscape?: boolean;

    /**
     * Should unescape string literals.
     */
    shouldUnescape?: boolean;

    /**
     * Generator must always generate table function whatever mustache expression contains.
     */
    alwaysTableFunction?: boolean;

    /**
     * Allow allocating string literals.
     */
    allowAllocatingLiterals?: boolean;
}

/**
 * Interface for mustache expression generator.
 *
 * @private
 */
export interface IMustacheGenerator<TFunction> {

    /**
     * Generate meta information for mustache expression.
     * @param {Node} node Node instance.
     * @param {IMustacheOptions} options Code generation options.
     */
    generate(node: Node, options: IMustacheOptions): IMustacheMeta<TFunction>;
}
