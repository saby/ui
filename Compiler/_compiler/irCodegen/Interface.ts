/**
 * @author Krylov M.A.
 */

export declare type TPrimitive = boolean | string | number;

export declare type TObject = Record<string, TPrimitive | TPrimitive[]> | IObjectProperty[];

export declare type TMustache = number;

export interface IGenerator<MustacheType, BodyType, ReturnType> {
    escape(value: unknown): ReturnType;

    createText(text?: string, key?: string): ReturnType;

    createDirective(text: string): ReturnType;

    createComment(text: string): ReturnType;

    createTag(name: string, configuration: unknown, children: unknown[]): ReturnType;

    createControl(method: unknown, configuration: unknown): ReturnType;

    createPartial(method: MustacheType, configuration: unknown): ReturnType;

    createTemplate(method: unknown, configuration: unknown): ReturnType;

    createInline(referenceId: number, name: string, configuration: unknown): ReturnType;

    evalDefaultScope(options: unknown): ReturnType;

    evalOptionsScope(options: unknown, scope: unknown): ReturnType;

    evalScope(options: unknown, scope: unknown): ReturnType;

    evalExpression(referenceId: number, comment?: string): ReturnType;

    evalExpression2(referenceId: number, comment?: string): ReturnType;

    closeExpression(referenceId: number, comment?: string): ReturnType;

    closeBindExpression(referenceId: number, comment?: string): ReturnType;

    createContentOption(referenceId: number, internalsMetaId?: number): ReturnType;

    evalContentOption(referenceId: number, internalsMetaId?: number): ReturnType;

    createFunction(name: string, data: unknown): ReturnType;

    if(test: MustacheType, body: BodyType): ReturnType;

    for(
        id: number,
        init: MustacheType,
        test: MustacheType,
        update: MustacheType,
        body: BodyType,
        internalsMetaId?: number
    ): ReturnType;

    foreach(
        id: number,
        identifiers: string[],
        collection: MustacheType,
        body: BodyType,
        internalsMetaId?: number
    ): ReturnType;
}

export interface IMethods<ReturnType> {
    sanitize(content: unknown): ReturnType;

    wrapUndefined(value: unknown): ReturnType;

    wrapString(value: unknown): ReturnType;

    getResourceURL(args: unknown[]): ReturnType;

    getter(data: unknown, path: string[]): ReturnType;

    setter(data: unknown, path: string[], value: unknown): ReturnType;

    decorate(name: unknown, args: string[]): ReturnType;

    call(funcContext: unknown, data: unknown, path: string[], args: unknown[]): ReturnType;

    call2(data: unknown, path: string[], args: unknown[]): ReturnType;

    dots(data: unknown): ReturnType;
}

export interface ITemplateBody<BodyType> {
    type: 'content' | 'template' | 'root';
    body?: BodyType;
    contents: BodyType[];
    name?: string;
    internal?: number[];
}

/**
 * Interface for top level module injections.
 *
 * @private
 */
export interface IInjections {

    /**
     * Should define debug function with debugger.
     */
    funcDebug?: boolean;

    /**
     * Should define defaultContextGetter function with following context.
     */
    funcDefaultContextGetter?: string;

    /**
     * Should load i18n module and define rk function variable.
     */
    varTranslate?: boolean;

    /**
     * Should define variable isWindowUndefined with value of typeof window === 'undefined'.
     */
    varIsWindowUndefined?: boolean;

    /**
     * Should define variable Strings with collected values.
     */
    varStrings?: string;
}

/**
 * Interface of generated module content.
 *
 * @private
 */
export interface IDescription {

    /**
     * Template module name for RequireJS.
     */
    moduleName: string;

    /**
     * Required injections in module body.
     */
    injections: IInjections;

    /**
     * Collection of all required dependencies.
     */
    dependencies: string[];

    /**
     * Exported data.
     */
    exports: string;
}

/**
 * IR template description.
 *
 * @private
 */
export interface IEntryPointDescription<BodyType> {

    /**
     * Template module name for RequireJS.
     */
    moduleName: string;

    /**
     * Collection of all required dependencies.
     */
    dependencies: string[];

    /**
     * First dependency index after IR and i18n dependencies.
     */
    dependenciesStartIndex: number;

    /**
     * Collection of all generated templates.
     */
    templates: ITemplateBody<BodyType>[];

    /**
     * Collection of reactive property names.
     */
    reactiveProperties: string | undefined;

    /**
     * Collection of all generated mustache expressions.
     */
    expressions: string[];

    /**
     * Collection of meta information for evaluating internal expressions.
     */
    internalsMeta: string[];

    /**
     * Collection of internal names at the top of module.
     */
    names?: string;
}

/**
 * Interface for generating IR description components.
 *
 * @private
 */
export interface IEntryPoint<BodyType, ReturnType> {

    /**
     * Generate code for creating export data with template description.
     * @param {IEntryPointDescription} description Template description.
     */
    generate(description: IEntryPointDescription<BodyType>): ReturnType;

    /**
     * Generate code for dependencies component.
     * @param {string[]} names Physical module paths.
     * @param {number} startIndex First dependency index.
     */
    wrapDependencies(names: string[], startIndex: number): ReturnType;

    /**
     * Generate content template component.
     * @param {<BodyType>} body IR template function.
     * @param {string} name Content option name.
     */
    wrapContentBody(body: BodyType, name: string): ReturnType;

    /**
     * Generate inline template component.
     * @param {string} name Inline template name.
     * @param {<BodyType>} body IR template function.
     */
    wrapTemplateBody(name: string, body: BodyType): ReturnType;

    /**
     * Generate root template component.
     * @param {<BodyType>} body IR template function.
     */
    wrapRootBody(body: BodyType): ReturnType;
}

/**
 * Interface for formatting generating source code.
 *
 * @private
 */
export interface IFormatter {

    /**
     * Current offset size.
     */
    offset: number;

    /**
     * New line character.
     */
    readonly newLineChar: string;

    /**
     * Initial offset size.
     */
    readonly initialOffset: number;

    /**
     * Format source line.
     * @param {TPrimitive} line Source line.
     * @param {boolean} newLine Start with new line.
     * @param {number?} offset Extra offset.
     */
    formatLine(line: TPrimitive, newLine?: boolean, offset?: number): string;

    /**
     * Format object.
     * @param {TObject} object Object representation.
     * @param {number?} offset Extra offset.
     */
    formatObject(object: TObject, offset?: number): string;

    /**
     * Format array.
     * @param {TPrimitive[]} elements Array elements.
     * @param {number?} offset Extra offset.
     */
    formatArray(elements: TPrimitive[], offset?: number): string;

    /**
     * Format sequence of elements.
     * @param {TPrimitive[]} elements Array elements.
     * @param {number?} offset Extra offset.
     */
    formatSequence(elements: TPrimitive[], offset?: number): string;

    /**
     * Enter new formatted block.
     */
    enter(size?: number): void;

    /**
     * Leave current formatted block.
     */
    leave(size?: number): void;
}

/**
 * Object property description.
 *
 * @private
 */
export interface IObjectProperty {

    /**
     * Object property name.
     */
    name: string;

    /**
     * Object property comment.
     */
    comment?: string;

    /**
     * Object property value.
     */
    value: TPrimitive;
}

/**
 * Interface for ECMAScript code generator.
 *
 * @private
 */
export interface IECMAScriptGenerator {

    /**
     * ECMAScript version.
     */
    readonly version: number;

    /**
     * Generate function.
     * @param {string} body Function body.
     * @param {string} name Function name.
     * @param {string[]?} params Function parameters.
     */
    toFunction(body: string, name: string, params?: string[]): string;

    /**
     * Generate anonymous function.
     * @param {string} body Function body.
     * @param {string[]?} params Function parameters.
     */
    toAnonymousFunction(body: string, params?: string[]): string;

    /**
     * Generate arrow function expression.
     * @param {string} expression Function expression.
     * @param {string[]?} params Function parameters.
     */
    toArrowExpression(expression: string, params?: string[]): string;
}

/**
 * Interface for generator which provides access to in-module string literals.
 *
 * @private
 */
export interface ISymbols {

    /**
     * Check if generator whenever was asked to generate access to in-module literals table.
     */
    readonly hasReferences: boolean;

    /**
     * Generate code for creating collection of string literals.
     */
    toStringsTableDefinition(): string | undefined;

    /**
     * Put reactive property names into table.
     */
    putReactiveProperties(reactiveProperties: string[]): void;

    /**
     * Allocate string literal and generate access to it.
     * @param {string} literal String literal expected to repeat multiple times in template module.
     */
    access(literal: string): string;

    /**
     * Generate code for creating collection of reactive property names using the table.
     */
    toReactiveProperties(): string | undefined;
}
