/**
 * @description Main wml compiler module.
 */

import * as ComponentCollector from './_core/deprecated/ComponentCollector';
import { parse } from './_html/Parser';
import { createErrorHandler } from './_utils/ErrorHandler';
import getWasabyTagDescription from './_core/Tags';
import { traverseSync } from './_core/bridge';
import * as codegenBridge from './_codegen/bridge';
import { IMainTemplateFunction } from 'Compiler/_codegen/Template';
import { clearSourceFromTmplBlocks } from './_codegen/JsTemplates';
import { ISource, Source } from './_utils/Source';
import { IOptions, Options } from './_utils/Options';
import { ModulePath } from './_utils/ModulePath';
import { ITranslationKey } from './_i18n/Dictionary';
import createModuleProcessor from './_codegen/Module';
import { writeModuleBody } from './_codegen/module/Body';
import { createGenerator } from './_codegen/ECMAScript';

/**
 * Флаг - генерировать rk-функции
 * @todo https://online.sbis.ru/opendoc.html?guid=ea8a25dd-5a2f-4330-8d6f-599c8c5878dd
 */
const USE_GENERATE_CODE_FOR_TRANSLATIONS = false;

// Паттерн подстановок генерации кода вида /*#паттерн#*/.
const COMMENT_LIKE_SUBSTITUTION_PATTERN = /\/\*#[A-Z_0-9]+#\*\//;

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

/**
 * Create empty artifact with default values.
 */
function createArtifact(options: IOptions): IArtifact {
    return {
        nodeName: ModulePath.createNodeName(options.modulePath),
        errors: [],
        text: null,
        umdText: null,
        localizedDictionary: [],
        dependencies: null,
        stable: false,
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

    /**
     * Flag that indicates that template contains translations.
     */
    hasTranslations: boolean;
}

/**
 * Check compiled JS code.
 * @param text {string} Compiled JS code.
 */
function validateCompiledText(text: string): void {
    if (COMMENT_LIKE_SUBSTITUTION_PATTERN.test(text)) {
        const firstPattern = text.match(COMMENT_LIKE_SUBSTITUTION_PATTERN);
        throw new Error(
            `Внутреняя ошибка компилятора: Обнаружена необработанная подстановка ${firstPattern[0]}`
        );
    }
}

/**
 * Represents base compiler methods for wml and tmpl.
 */
abstract class BaseCompiler implements ICompiler {
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
     * @param template Template function.
     * @param traversed Traversed object.
     * @param options Compiler options.
     * @param moduleType Module type in which template must be compiled.
     */
    generateModule(
        template: IMainTemplateFunction,
        traversed: ITraversed,
        options: IOptions,
        moduleType: string
    ): string {
        const processor = createModuleProcessor(moduleType);
        const generator = createGenerator(options.ESVersion);

        processor.setStrictMode(true);

        writeModuleBody(
            processor,
            template,
            traversed.dependencies,
            traversed.ast.reactiveProps,
            traversed.hasTranslations,
            options,
            generator
        );

        let source = processor.compile();

        if (options.isWasabyTemplate) {
            source = clearSourceFromTmplBlocks(source);
        }

        validateCompiledText(source);

        return source;
    }

    /**
     * Generate code for template.
     * @param traversed Traverse object.
     * @param options Compiler options.
     */
    generateFunction(
        traversed: ITraversed,
        options: IOptions
    ): IMainTemplateFunction {
        const codeGenOptions = {
            ...options,
            generateTranslations:
                ((options.generateCodeForTranslations &&
                    USE_GENERATE_CODE_FOR_TRANSLATIONS) ||
                    !USE_GENERATE_CODE_FOR_TRANSLATIONS) &&
                traversed.hasTranslations,
        };
        const tmplFunc = codegenBridge.getFunction(
            traversed.ast,
            null,
            codeGenOptions,
            null,
            true
        );

        if (!tmplFunc) {
            throw new Error(
                'Шаблон не может быть построен. Не загружены зависимости.'
            );
        }

        return tmplFunc;
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
            errorHandler,
        });
        const hasFailures = errorHandler.hasFailures();
        const lastMessage = hasFailures
            ? errorHandler.popLastErrorMessage()
            : undefined;
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
        return new Promise<IArtifact>(
            (resolve: (IArtifact) => void, reject: (IArtifact) => void) => {
                const artifact = this.compileSync(text, options);
                if (artifact.stable) {
                    resolve(artifact);
                    return;
                }
                reject(artifact);
            }
        );
    }

    compileSync(text: string, options: IOptions): IArtifact {
        const artifact: IArtifact = createArtifact(options);
        try {
            const source: ISource = this.createSource(text, options.fileName);
            const traversed = this.traverse(source, options);

            this.initWorkspace(traversed.templateNames);
            const tmplFunc = this.generateFunction(traversed, options);

            for (const moduleType of options.moduleType) {
                switch (moduleType) {
                    case 'amd':
                        artifact.text = this.generateModule(
                            tmplFunc,
                            traversed,
                            options,
                            moduleType
                        );
                        break;

                    case 'umd':
                        artifact.umdText = this.generateModule(
                            tmplFunc,
                            traversed,
                            options,
                            moduleType
                        );
                        break;
                }
            }

            artifact.localizedDictionary = traversed.localizedDictionary;
            artifact.dependencies = traversed.dependencies;

            if (!artifact.text && !artifact.umdText) {
                artifact.errors.push(
                    new Error(
                        'Внутреняя ошибка компилятора: ' +
                            `Шаблон не был скомпилирован ни в один из форматов ${JSON.stringify(
                                options.moduleType
                            )}`
                    )
                );
            }

            artifact.stable = artifact.errors.length === 0;
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
}

/**
 * This class represents methods to compile wml files.
 */
class CompilerWml extends BaseCompiler {
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
        artifact.errors.push(
            new Error(
                'Данное расширение шаблона не поддерживается. Получен шаблон с расширением "' +
                    options.modulePath.extension +
                    '". Ожидалось одно из следующих расширений: wml, tmpl.'
            )
        );
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
