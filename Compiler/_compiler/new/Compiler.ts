/**
 * @author Krylov M.A.
 */

import type { ICompiler, IOptions, IArtifact } from '../Interface';
import type { IErrorHandler } from '../utils/ErrorHandler';
import type { ISource } from '../utils/Source';
import type { Node } from '../html/Nodes';
import type { Ast } from '../core/Ast';
import type { IAnnotation } from '../core/IRAnnotator';
import type { IDescription } from '../irCodegen/Interface';

import { ModulePath } from '../utils/ModulePath';
import { createErrorHandler } from '../utils/ErrorHandler';
import Scope from '../core/Scope';
import { Source } from '../utils/Source';
import { parse } from '../html/Parser';
import getWasabyTagDescription from '../core/Tags';
import { Parser } from '../expressions/Parser';
import { createTextTranslator } from '../i18n/Translator';
import traverse from '../core/Traverse';
import { annotate } from '../core/IRAnnotator';
import createModuleProcessor from '../irCodegen/Module';
import createGenerator from '../irCodegen/Generator';

import {
    ENTRY_POINT_IDENTIFIER,
    TRANSLATION_FUNCTION,
    DEBUG_FUNCTION,
    IS_WINDOW_UNDEFINED_IDENTIFIER,
    STRINGS_IDENTIFIER
} from '../irCodegen/Constants';

/**
 * Флаг - генерировать rk-функции
 * @todo https://online.sbis.ru/opendoc.html?guid=ea8a25dd-5a2f-4330-8d6f-599c8c5878dd
 */
const USE_GENERATE_CODE_FOR_TRANSLATIONS = false;

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

// FIXME: Разобраться с пробелами в текстовых узлах
function shouldPreprocessTextNodes(options: IOptions): boolean {
    const uiModuleName = options.modulePath.getInterfaceModule();
    if (uiModuleName === 'HelpFilling') {
        return false;
    }
    return options.modulePath.extension === 'wml';
}

function createSource(text: string, fileName: string): ISource {
    return new Source(text, fileName);
}

function checkErrors(errorHandler: IErrorHandler) {
    const hasFailures = errorHandler.hasFailures();

    if (hasFailures) {
        const lastMessage = hasFailures ? errorHandler.popLastErrorMessage() : undefined;
        errorHandler.flush();

        throw new Error(lastMessage);
    }
}

export class NewCompilerWml implements ICompiler {

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
        const scope = new Scope(!options.fromBuilderTmpl);
        const errorHandler = createErrorHandler(!options.fromBuilderTmpl);
        const source: ISource = createSource(text, options.fileName);

        try {
            const html = this.parse(source, options, errorHandler);
            const ast = this.traverse(html, options, scope, errorHandler);
            const annotation = this.annotate(ast, options, errorHandler);
            const description = this.generate(annotation, options, errorHandler);

            for (const moduleType of options.moduleType) {
                switch (moduleType) {
                    case 'amd':
                        artifact.text = this.wrapWithModule(
                            description,
                            options,
                            moduleType
                        );
                        break;

                    case 'umd':
                        artifact.umdText = this.wrapWithModule(
                            description,
                            options,
                            moduleType
                        );
                        break;
                }
            }

            artifact.dependencies = description.dependencies;
            artifact.localizedDictionary = scope.getTranslationKeys();

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
            errorHandler.flush();
        }

        return artifact;
    }

    private parse(source: ISource, options: IOptions, errorHandler: IErrorHandler): Node[] {
        // TODO: реализовать whitespace visitor и убрать флаг needPreprocess
        const html = parse(source.text, options.fileName, {
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

        checkErrors(errorHandler);

        return html;
    }

    private traverse(parsed: Node[], options: IOptions, scope: Scope, errorHandler: IErrorHandler): Ast[] {
        const config = {
            expressionParser: new Parser(),
            hierarchicalKeys: true,
            errorHandler,
            allowComments: false,
            textTranslator: createTextTranslator(options.componentsProperties || { }),
            generateTranslations:
                (USE_GENERATE_CODE_FOR_TRANSLATIONS && !!options.generateCodeForTranslations) ||
                !USE_GENERATE_CODE_FOR_TRANSLATIONS,
            hasExternalInlineTemplates: options.hasExternalInlineTemplates,
            checkInlineTemplateName: options.isWasabyTemplate
        };
        const traverseOptions = {
            fileName: options.fileName,
            scope,
            translateText: true
        };

        const ast = traverse(parsed, config, traverseOptions);

        checkErrors(errorHandler);

        return ast;
    }

    private annotate(ast: Ast[], options: IOptions, errorHandler: IErrorHandler): IAnnotation {
        const moduleName = ModulePath.createNodeName(options.modulePath);
        const annotation = annotate(errorHandler, ast, moduleName);

        checkErrors(errorHandler);

        return annotation;
    }

    private generate(annotation: IAnnotation, options: IOptions, errorHandler: IErrorHandler): IDescription<string> {
        const generator = createGenerator(options.ESVersion, options.isReleaseMode, options.isWasabyTemplate, 1);
        const description = generator.generate(annotation);

        checkErrors(errorHandler);

        return description;
    }

    private wrapWithModule(description: IDescription<string>, options: IOptions, moduleType: string) {
        const processor = createModuleProcessor(moduleType);
        processor.setModuleName(description.moduleName);
        processor.setStrictMode(true);

        // обязательные именованные зависимости добавляются в самом начале
        processor.addDependency('Compiler/IR', ENTRY_POINT_IDENTIFIER);
        const translationFunctionName = options.isWasabyTemplate ? TRANSLATION_FUNCTION : `_${TRANSLATION_FUNCTION}`;
        if (description.injections.varTranslate) {
            processor.addDependency(`i18n!${options.modulePath.getInterfaceModule()}`, translationFunctionName);
        }

        // следом добавляем все остальные зависимости шаблона
        for (let index = 0; index < description.dependencies.length; ++index) {
            processor.addDependency(description.dependencies[index]);
        }

        // добавляем определения используемых в шаблоне сущностей
        if (description.injections.funcDebug) {
            processor.addCodeBlock(`function ${DEBUG_FUNCTION}() { debugger; }`);
        }

        if (description.injections.funcDefaultContextGetter) {
            processor.addCodeBlock(description.injections.funcDefaultContextGetter);
        }

        if (description.injections.varIsWindowUndefined) {
            processor.addCodeBlock(`var ${IS_WINDOW_UNDEFINED_IDENTIFIER} = typeof window === "undefined";`);
        }

        if (description.injections.varStrings) {
            processor.addCodeBlock(`var ${STRINGS_IDENTIFIER} = ${description.injections.varStrings};`);
        }

        if (description.injections.varTranslate && !options.isWasabyTemplate) {
            processor.addCodeBlock(
                `function ${TRANSLATION_FUNCTION}(key, context, pluralNumber) { return ${translationFunctionName}(key, context, pluralNumber); }`
            );
        }

        processor.setReturnableExport(description.exports);

        return processor.compile();
    }
}
