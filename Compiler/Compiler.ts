/**
 * @description Main wml compiler module.
 * @author Крылов М.А.
 */

import * as ComponentCollector from './core/deprecated/ComponentCollector';
import { parse } from './html/Parser';
import { createErrorHandler } from './utils/ErrorHandler';
import getWasabyTagDescription from './core/Tags';
import { traverseSync } from './core/bridge';
import * as codegenBridge from './codegen/bridge';
import * as templates from './codegen/templates';
import { ISource, Source } from './utils/Source';
import { IOptions, Options } from './utils/Options';
import { ModulePath } from './utils/ModulePath';
import { ITranslationKey } from './i18n/Dictionary';

/**
 * Флаг - генерировать rk-функции
 * @todo https://online.sbis.ru/opendoc.html?guid=ea8a25dd-5a2f-4330-8d6f-599c8c5878dd
 */
const USE_GENERATE_CODE_FOR_TRANSLATIONS = false;

// Паттерн подстановок генерации кода вида /*#паттерн#*/.
const COMMENT_LIKE_SUBSTITUTION_PATERN = /\/\*#[A-Z_0-9]+#\*\//;

// FIXME: Разобраться с пробелами в текстовых узлах
function shouldPreprocessTextNodes(options: IOptions): boolean {
   const uiModuleName = options.modulePath.getInterfaceModule();
   if (uiModuleName === 'HelpFilling') {
      return false;
   }
   return options.modulePath.extension === 'wml';
}

/**
 * Represents compiler interface.
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
    * Compile result: Javascript source code.
    */
   text: string;

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

/**
 * Create empty artifact with default values.
 */
function createArtifact(options: IOptions): IArtifact {
   return {
      nodeName: ModulePath.createNodeName(options.modulePath),
      errors: [],
      text: null,
      localizedDictionary: [],
      dependencies: null,
      stable: false
   };
}

/**
 * Represents abstract syntax tree interface as array of "object" - abstract syntax nodes.
 * FIXME: release interfaces for these nodes.
 */
interface IAST extends Array<Object> {
   childrenStorage: string[];
   reactiveProps: string[];
   templateNames: string[];
   __newVersion: boolean;
   hasTranslations: boolean;
}

/**
 * Represents interface for traverse resulting object.
 */
interface ITraversed {

   /**
    * Abstract syntax tree.
    */
   ast: IAST;

   /**
    * Translations dictionary.
    */
   localizedDictionary: ITranslationKey[];

   /**
    * Array of input file dependencies.
    */
   dependencies: string[];

   /**
    * Collection of inline template names.
    */
   templateNames: string[];

   hasTranslations: boolean;
}

/**
 * Check compiled JS code.
 * @param text {string} Compiled JS code.
 */
function validateCompiledText(text: string): void {
   if (COMMENT_LIKE_SUBSTITUTION_PATERN.test(text)) {
      const firstPattern = text.match(COMMENT_LIKE_SUBSTITUTION_PATERN);
      throw new Error(
         `(внутренняя ошибка компилятора) Обнаружена необработанная подстановка ${firstPattern[0]}`
      );
   }
}

/**
 * Represents base compiler methods for wml and tmpl.
 */
abstract class BaseCompiler implements ICompiler {
   protected constructor() { }

   /**
    * Do initialize before compilation process.
    */
   abstract initWorkspace(templateNames: string[]): void;

   /**
    * Clean needed variables after compilation process.
    */
   abstract cleanWorkspace(): void;

   /**
    * Create source for input source text.
    * @param text Input source text.
    * @param fileName Source file name.
    */
   abstract createSource(text: string, fileName: string): ISource;

   /**
    * Generate template module.
    * @param func Template function.
    * @param deps Array of dependencies.
    * @param reactive Array of names of reactive variables.
    * @param path Template module path.
    * @param hasTranslations Translation unit contains translation constructions.
    */
   abstract generateModule(func: any, deps: string[], reactive: string[], path: ModulePath, hasTranslations: boolean): string;

   /**
    * Generate code for template.
    * @param traversed Traverse object.
    * @param options Compiler options.
    */
   generate(traversed: ITraversed, options: IOptions): string {
      const codeGenOptions = {
         ...options,
         generateTranslations: (
             options.generateCodeForTranslations && USE_GENERATE_CODE_FOR_TRANSLATIONS
             || !USE_GENERATE_CODE_FOR_TRANSLATIONS
         ) && traversed.hasTranslations
      };
      // tslint:disable:prefer-const
      let tmplFunc = codegenBridge.getFunction(traversed.ast, null, codeGenOptions, null, true);
      if (!tmplFunc) {
         throw new Error('Шаблон не может быть построен. Не загружены зависимости.');
      }
      const text = this.generateModule(
          tmplFunc, traversed.dependencies, traversed.ast.reactiveProps, options.modulePath, traversed.hasTranslations
      );
      validateCompiledText(text);
      return text;
   }

   /**
    * Traverse source code.
    * @param source Source code.
    * @param options Compiler options.
    */
   traverse(source: ISource, options: IOptions): ITraversed {
      // TODO: реализовать whitespace visitor и убрать флаг needPreprocess
      const errorHandler = createErrorHandler(!options.fromBuilderTmpl);
      const parsed = parse(source.text, options.fileName, {
         xml: true,
         allowComments: true,
         allowCDATA: true,
         compatibleTreeStructure: true,
         rudeWhiteSpaceCleaning: true,
         normalizeLineFeed: true,
         cleanWhiteSpaces: true,
            needPreprocess: shouldPreprocessTextNodes(options),
         tagDescriptor: getWasabyTagDescription,
         errorHandler
      });
      const hasFailures = errorHandler.hasFailures();
      const lastMessage = hasFailures ? errorHandler.popLastErrorMessage() : undefined;
      errorHandler.flush();
      if (hasFailures) {
         throw new Error(lastMessage);
      }
      const dependencies = ComponentCollector.getComponents(parsed);
      return traverseSync(parsed, options, dependencies);
   }

   /**
    * Compile input source code into Javascript code.
    * @param text Input source code.
    * @param options Compiler options.
    */
   compile(text: string, options: IOptions): Promise<IArtifact> {
      return new Promise<IArtifact>((resolve: any, reject: any) => {
         const artifact = this.compileSync(text, options);
         if (artifact.stable) {
            resolve(artifact);
            return;
         }
         reject(artifact);
      });
   }

   compileSync(text: string, options: IOptions): IArtifact {
      const artifact: IArtifact = createArtifact(options);
      try {
         const source: ISource = this.createSource(text, options.fileName);
         const traversed = this.traverse(source, options);
         this.initWorkspace(traversed.templateNames);
         artifact.text = this.generate(traversed, options);
         artifact.localizedDictionary = traversed.localizedDictionary;
         artifact.dependencies = traversed.dependencies;
         artifact.stable = true;
      } catch (error) {
         artifact.errors.push(error);
      } finally {
         this.cleanWorkspace();
      }
      return artifact;
   }
}

/**
 * This class represents methods to compile tmpl files.
 */
class CompilerTmpl extends BaseCompiler {
   constructor() {
      super();
   }

   /**
    * Do initialize before compilation process.
    */
   initWorkspace(templateNames: string[]): void {
      codegenBridge.initWorkspaceTMPL(templateNames);
   }

   /**
    * Clean needed variables after compilation process.
    */
   cleanWorkspace(): void {
      codegenBridge.cleanWorkspace();
   }

   /**
    * Create source for input source text.
    * @param text Input source text.
    * @param fileName Source file name.
    */
   createSource(text: string, fileName: string): ISource {
      return new Source(text, fileName);
   }

   /**
    * Generate template module.
    * @param func Template function.
    * @param deps Array of dependencies.
    * @param reactive Array of names of reactive variables.
    * @param path Template module path.
    * @param hasTranslations Translation unit contains translation constructions.
    */
   generateModule(func: any, deps: string[], reactive: string[], path: ModulePath, hasTranslations: boolean): string {
      return templates.generateDefineTmpl(
         path.module, path.extension, func, deps, reactive, hasTranslations
      );
   }
}

/**
 * This class represents methods to compile wml files.
 */
class CompilerWml extends BaseCompiler {
   constructor() {
      super();
   }

   /**
    * Do initialize before compilation process.
    */
   initWorkspace(templateNames: string[]): void {
      codegenBridge.initWorkspaceWML(templateNames);
   }

   /**
    * Clean needed variables after compilation process.
    */
   cleanWorkspace(): void {
      codegenBridge.cleanWorkspace();
   }

   /**
    * Create source for input source text.
    * @param text Input source text.
    * @param fileName Source file name.
    */
   createSource(text: string, fileName: string): ISource {
      return new Source(text, fileName);
   }

   /**
    * Generate template module.
    * @param func Template function.
    * @param deps Array of dependencies.
    * @param reactive Array of names of reactive variables.
    * @param path Template module path.
    * @param hasTranslations Translation unit contains translation constructions.
    */
   generateModule(func: any, deps: string[], reactive: string[], path: ModulePath, hasTranslations: boolean): string {
      const module = templates.generateDefine(
         path.module, path.extension, func, deps, reactive, hasTranslations
      );
      return templates.clearSourceFromDeprecated(module);
   }
}

let DoT;

/**
 * This class represents methods to compile xhtml files.
 */
class CompilerXHTML implements ICompiler {
   /**
    * Generate template module.
    * @param func Template function.
    * @param path Template module path.
    */
   generate(func: any, path: ModulePath): string {
      const localizationModule = 'i18n!' + path.getInterfaceModule();
      const templateModuleRequire = 'html!' + path.module;
      const template = func.toString().replace(/[\n\r]/g, '');
      return 'define("' + templateModuleRequire + '",["' + localizationModule + '"],function(){' +
         'var f=' + template + ';' +
         'f.toJSON=function(){' +
         'return {$serialized$:"func", module:"' + templateModuleRequire + '"}' +
         '};return f;});';
   }

   /**
    * Compile input source code into Javascript code.
    * @param text Input source code.
    * @param options Compiler options.
    */
   compile(text: string, options: IOptions): Promise<IArtifact> {
      return new Promise((resolve: any, reject: any) => {
         const artifact = this.compileSync(text, options);
         if (artifact.stable) {
            resolve(artifact);
            return;
         }
         reject(artifact);
      });
   }

   /**
    * Compile input source code into Javascript code.
    * @param text Input source code.
    * @param options Compiler options.
    */
   compileSync(text: string, options: IOptions): IArtifact {
      const artifact: IArtifact = createArtifact(options);
      if (!DoT) {
         DoT = requirejs.defined('Core/js-template-doT') && requirejs('Core/js-template-doT');
      }
      try {
         // tslint:disable:prefer-const
         let config = DoT.getSettings();
         // tslint:disable:prefer-const
         let template = DoT.template(text, config, undefined, undefined, options.modulePath.module);
         artifact.text = this.generate(template, options.modulePath);
         artifact.stable = true;
      } catch (error) {
         artifact.errors.push(error);
      }
      return artifact;
   }
}

/**
 * This class only represents returning error.
 */
class ErrorCompiler implements ICompiler {
   compile(text: string, options: IOptions): Promise<IArtifact> {
      return Promise.reject(this.compileSync(text, options));
   }

   compileSync(text: string, options: IOptions): IArtifact {
      const artifact = createArtifact(options);
      artifact.errors.push(new Error(
          'Данное расширение шаблона не поддерживается. Получен шаблон с расширением "' +
          options.modulePath.extension +
          '". Ожидалось одно из следующих расширений: wml, tmpl, xhtml.'
      ));
      return artifact;
   }
}

/**
 * Get actual compiler with input source file extension.
 * @param extension Source file extension.
 */
function getCompiler(extension: string): ICompiler {
   switch (extension) {
      case 'wml':
         return new CompilerWml();
      case 'tmpl':
         return new CompilerTmpl();
      case 'xhtml':
         return new CompilerXHTML();
      default:
         return new ErrorCompiler();
   }
}

/**
 * Common class for compiling.
 */
export class Compiler implements ICompiler {

   /**
    * Compile input source code into Javascript code.
    * @param text Input source code.
    * @param config Compiler options.
    */
   compile(text: string, config: IOptions): Promise<IArtifact> {
      const options = new Options(config);
      const compiler = getCompiler(options.modulePath.extension);
      return compiler.compile(text, options);
   }

   /**
    * Compile input source code into Javascript code.
    * @param text Input source code.
    * @param config Compiler options.
    */
   compileSync(text: string, config: IOptions): IArtifact {
      const options = new Options(config);
      const compiler = getCompiler(options.modulePath.extension);
      return compiler.compileSync(text, options);
   }
}
