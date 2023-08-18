/**
 * @description Represents processing scope mechanism.
 */

import * as Ast from './Ast';
import { ITranslationsRegistrar } from './Text';
import { IPath } from './Resolvers';
import { Dictionary, ITranslationKey, TranslationType } from '../i18n/Dictionary';
// @ts-ignore TODO: This module can only be referenced with ECMAScript imports/exports
//             by turning on the 'esModuleInterop' flag and referencing its default export.
import * as ParallelDeferred from 'Types/ParallelDeferred';
import createController, { IDependenciesController } from './Dependencies';

/**
 * Interface of collection of inner template representations.
 */
interface ITemplates {
    [name: string]: Ast.TemplateNode;
}

/**
 * Represents methods to work with object that depends on scope.
 */
export default class Scope implements ITranslationsRegistrar {
    /**
     * Collection of inner template representations.
     */
    private readonly templates: ITemplates;

    /**
     * Controller of dependencies.
     */
    private readonly dependenciesController: IDependenciesController;

    /**
     * Translations dictionary.
     */
    private readonly dictionary: Dictionary;

    /**
     * Flag for detected translations in Mustache-expression.
     */
    private hasTranslationInExpression: boolean;

    /**
     * Initialize new instance of scope.
     * @param loadDependencies {boolean} Load registered dependencies for only JIT compilation.
     */
    constructor(loadDependencies: boolean = false) {
        this.templates = {};
        this.dependenciesController = createController(loadDependencies);
        this.dictionary = new Dictionary();
        this.hasTranslationInExpression = false;
    }

    /**
     * Register dependency.
     * @param path {IPath} Dependency path.
     */
    registerDependency(path: IPath): void {
        this.dependenciesController.registerDependency(path);
    }

    /**
     * Request all registered dependencies.
     */
    requestDependencies(): ParallelDeferred {
        return this.dependenciesController.requestDependencies();
    }

    /**
     * Register translation key.
     * @param type {TranslationType} Translation type.
     * @param module {string} Template file where translation item was discovered.
     * @param text {string} Translation text.
     * @param context {string} Translation context.
     */
    registerTranslation(
        type: TranslationType,
        module: string,
        text: string,
        context: string
    ): void {
        this.dictionary.push(type, module, text, context);
    }

    /**
     * Get all collected keys.
     */
    getTranslationKeys(): ITranslationKey[] {
        return this.dictionary.getKeys();
    }

    /**
     * Register template definition.
     * @param name {string} Template name.
     * @param ast {TemplateNode} Template node.
     * @throws {Error} Throws error in case of template re-definition.
     */
    registerTemplate(name: string, ast: Ast.TemplateNode): void {
        if (this.templates.hasOwnProperty(name)) {
            throw new Error(`шаблон с именем "${name}" уже был определен`);
        }
        this.templates[name] = ast;
    }

    /**
     * Check if template has been already declared.
     * @param name {string} Template name.
     * @returns {boolean} Returns true in case of declared template.
     */
    hasTemplate(name: string): boolean {
        return this.templates.hasOwnProperty(name);
    }

    /**
     * Get collection of defined template names.
     * @returns {string[]} Returns collection of defined template names.
     */
    getTemplateNames(): string[] {
        return Object.keys(this.templates);
    }

    /**
     * Get template node by its name.
     * @param name {string} Template name.
     * @returns {TemplateNode} Template node.
     * @throws {Error} Throws error in case of template is undefined.
     */
    getTemplate(name: string): Ast.TemplateNode {
        if (!this.templates.hasOwnProperty(name)) {
            throw new Error(`шаблон с именем "${name}" не был определен`);
        }
        return this.templates[name];
    }

    /**
     * Set "enabled" to flag for detected translations in Mustache-expression.
     */
    setDetectedTranslation(): void {
        this.hasTranslationInExpression = true;
    }

    /**
     * Check if current AST scope contains translations.
     */
    hasDetectedTranslations(): boolean {
        return this.dictionary.hasKeys() || this.hasTranslationInExpression;
    }
}
