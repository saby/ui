/**
 * @description Represents interfaces and classes to work with compiler options.
 */

import type { IJSDocSchema } from '../i18n/JSDoc';
import type { IOptions, ITraverseOptions } from '../Interface';

import Config from '../Config';
import { ModulePath } from './ModulePath';
import { ECMAScript2021, ECMAScript5 } from '../codegen/ECMAScript';

/**
 * Список поддерживаемых модулей, в которые возможна генерация шаблонов.
 */
const SUPPORTED_MODULE_TYPES = ['amd', 'umd'];

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

function validateECMAScriptVersion(esVersion: number): number {
    if (esVersion === ECMAScript5) {
        return ECMAScript5;
    }

    return ECMAScript2021;
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
     * ECMAScript version.
     */
    readonly ESVersion: number;

    /**
     * Use new code generation.
     */
    readonly useNewCodegen: boolean;

    /**
     * Generate template module in release mode with short aliases and optimizations.
     */
    readonly isReleaseMode: boolean;

    /**
     * Translatable control options dictionary.
     */
    componentsProperties: IJSDocSchema;

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
        this.moduleType = validateModuleType(createModuleTypeDef(options.moduleType));
        this.ESVersion = validateECMAScriptVersion(options.ESVersion);
        this.useNewCodegen = options.useNewCodegen;
        this.isReleaseMode = options.isReleaseMode;
    }
}
