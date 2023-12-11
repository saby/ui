/**
 * @author Krylov M.A.
 */

import type { ITranslationKey } from './i18n/Dictionary';
import type { IJSDocSchema } from './i18n/JSDoc';
import type { ModulePath } from './utils/ModulePath';

/**
 * Represents interface for traverse config.
 *
 * @public
 */
export interface ITraverseOptions {
    /**
     * Array of ignored nodes.
     * Usually has single 'comment' item.
     */
    ignored: string[];

    /**
     * Control names which must keep dots in its names.
     */
    mustBeDots: string[];

    /**
     * Maximum module name length.
     */
    moduleMaxNameLength: number;

    /**
     * Javascript reserved words.
     */
    reservedWords: string[];

    /**
     * HTML boolean attributes.
     */
    booleanAttributes: string[];
}

/**
 * Compiler options.
 *
 * @public
 */
export interface IOptions {

    /**
     * Relative path to module with its extension.
     * FIXME: Do refactor.
     */
    fileName: string;

    /**
     * Flag for saby/builder.
     */
    fromBuilderTmpl: boolean;

    /**
     * Flag for creating translations dictionary.
     * FIXME: Do refactor (createTranslations).
     */
    createResultDictionary: boolean;

    /**
     * Translatable control options dictionary.
     * FIXME: Do refactor (controlsProperties).
     */
    componentsProperties: IJSDocSchema;

    /**
     * Generate rk-instructions.
     * TODO: Enable this option.
     */
    generateCodeForTranslations: boolean;

    /**
     * The template has references to inline-templates that defined in other file.
     */
    hasExternalInlineTemplates: boolean;

    /**
     * Compiling module type.
     */
    moduleType: string | string[];

    /**
     * ECMAScript version.
     */
    ESVersion: number;

    /**
     * Use new code generation.
     */
    useNewCodegen: boolean;

    /**
     * Generate template module in release mode with short aliases and optimizations.
     */
    isReleaseMode: boolean;

    /**
     * Relative path to module with its extension.
     */
    modulePath: ModulePath;

    /**
     * Flag for wml templates.
     */
    isWasabyTemplate: boolean;

    /**
     * Traverse options.
     * FIXME: Do refactor (traverseOptions).
     */
    config: ITraverseOptions;
}

/**
 * Represents compiler interface.
 *
 * @public
 */
export interface ICompiler {
    /**
     * Compile input text.
     * @param text Source code text.
     * @param options Compiler options.
     */
    compile(text: string, options: IOptions): Promise<IArtifact>;

    /**
     * Compile input text.
     * @param text Source code text.
     * @param options Compiler options.
     */
    compileSync(text: string, options: IOptions): IArtifact;
}

/**
 * Represents artifact interface.
 *
 * @public
 */
export interface IArtifact {
    /**
     * Node name for require.
     */
    nodeName: string;

    /**
     * Array of happened errors.
     * FIXME: release error handler.
     */
    errors: Error[];

    /**
     * Compile result: Javascript source code in AMD module format.
     */
    text: string;

    /**
     * Compile result: Javascript source code in UMD module format.
     */
    umdText: string;

    /**
     * Translations dictionary.
     */
    localizedDictionary: ITranslationKey[];

    /**
     * Array of input file dependencies.
     */
    dependencies: string[];

    /**
     * Flag whether compile result is stable.
     * It is stable if and only if there were not fatal errors.
     */
    stable: boolean;
}
