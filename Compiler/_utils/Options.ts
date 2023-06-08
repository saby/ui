/**
 * @description Represents interfaces and classes to work with compiler options.
 */

import { Config } from '../Config';
import { ModulePath } from './ModulePath';

/**
 * Список поддерживаемых модулей, в которые возможна генерация шаблонов.
 */
const SUPPORTED_MODULE_TYPES = ['amd', 'umd'];

/**
 * Represents interface for traverse config.
 */
interface ITraverseOptions {
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
 */
export interface IOptions {
    /**
     * Relative path to module with its extension.
     */
    modulePath: ModulePath;

    /**
     * Relative path to module with its extension.
     * FIXME: Do refactor.
     */
    fileName: string;

    /**
     * Flag for saby/builder.
     * FIXME: Do refactor (useJIT).
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
    componentsProperties: object;

    /**
     * Traverse options.
     * FIXME: Do refactor (traverseOptions).
     */
    config: ITraverseOptions;

    /**
     * Flag for wml templates.
     */
    isWasabyTemplate: boolean;

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
}

function createModuleTypeDef(moduleType: IOptions['moduleType']): string[] {
    if (Array.isArray(moduleType)) {
        return moduleType.map((m) => {
            return m.toLowerCase();
        });
    }

    return [moduleType?.toLowerCase() || 'amd'];
}

function validateModuleType(modules: string[]): string[] {
    for (const moduleType of modules) {
        if (!SUPPORTED_MODULE_TYPES.includes(moduleType)) {
            throw new Error(
                `Переданный формат генерации модулей "${moduleType}" не поддерживается компилятором`
            );
        }
    }
    return modules;
}

/**
 * Represents compiler options data.
 */
export class Options implements IOptions {
    /**
     * Relative path to module with its extension.
     */
    readonly modulePath: ModulePath;

    /**
     * Relative path to module with its extension.
     */
    readonly fileName: string;

    /**
     * Flag for saby/builder.
     */
    readonly fromBuilderTmpl: boolean;

    /**
     * Flag for creating translations dictionary.
     */
    readonly createResultDictionary: boolean;

    /**
     * The template has references to inline-templates that defined in other file.
     */
    readonly hasExternalInlineTemplates: boolean;

    /**
     * Compiling module type.
     */
    readonly moduleType: string[];

    /**
     * Translatable control options dictionary.
     */
    componentsProperties: object;

    /**
     * Traverse options.
     */
    config: ITraverseOptions;

    /**
     * Flag for wml templates.
     */
    isWasabyTemplate: boolean;

    /**
     * Generate rk-instructions.
     */
    generateCodeForTranslations: boolean;

    /**
     * Initialize new instance of compiler options.
     * @param options {IOptions} Compiler options.
     */
    constructor(options: IOptions) {
        this.modulePath = new ModulePath(options.fileName);
        // FIXME: Compatibility with prev builder version (diff checking stage)
        this.fileName = this.modulePath.module;
        this.fromBuilderTmpl = !!options.fromBuilderTmpl;
        this.createResultDictionary = !!options.createResultDictionary;
        this.hasExternalInlineTemplates = !!options.hasExternalInlineTemplates;
        this.componentsProperties = options.componentsProperties || {};
        this.config = options.config || (Config as ITraverseOptions);
        this.isWasabyTemplate = this.modulePath.extension === 'wml';
        this.generateCodeForTranslations = options.generateCodeForTranslations;
        this.moduleType = validateModuleType(
            createModuleTypeDef(options.moduleType)
        );
    }
}
