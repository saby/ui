import { Generator } from '../ECMAScript';
import { IModuleProcessor } from './Base';
import { ModulePath } from '../../utils/ModulePath';
import { IOptions } from '../../Interface';
import { functionToString, IMainTemplateFunction } from '../Template';
import {
    TMPL_BLOCK_START,
    TMPL_BLOCK_END,
    generateDependenciesList,
    getMainTemplateFunctionName,
    generateFunctions,
    generateInlineTemplates,
} from '../JsTemplates';
import { T_HELPERS_NAME } from '../TClosure';
import { getDynamicPropertiesDeclaration } from '../Header';

/**
 * Записать блоки кода в модуль.
 * @param processor {IModuleProcessor} Процессор модуля.
 * @param templateFunction {IMainTemplateFunction} Главная шаблонная функция.
 * @param deps {string[]} Массив зависимостей.
 * @param reactive {string[]} Массив имен реактивных переменных.
 * @param hasTranslations {boolean} Флаг наличия в шаблоне rk-функций.
 * @param generator Генератор JavaScript кода.
 * @param options {IOptions} Опции компиляции.
 */
export function writeModuleBody(
    processor: IModuleProcessor,
    templateFunction: IMainTemplateFunction,
    deps: string[],
    reactive: string[],
    hasTranslations: boolean,
    options: IOptions,
    generator: Generator
): void {
    const nodeName = ModulePath.createNodeName(options.modulePath);
    processor.setModuleName(nodeName);
    processor.setStrictMode(true);

    let dependenciesShift = 1;
    processor.addDependency('UI/Executor', 'Executor');
    if (hasTranslations) {
        dependenciesShift = 2;
        processor.addDependency(`i18n!${options.modulePath.getInterfaceModule()}`, 'rk');
    }
    for (let index = 0; index < deps.length; ++index) {
        processor.addDependency(deps[index]);
    }

    const depsIdentifier = options.isWasabyTemplate ? 'depsLocal' : '_deps';
    const dependenciesList = generateDependenciesList(deps, dependenciesShift, depsIdentifier);
    const template = functionToString(
        templateFunction,
        getMainTemplateFunctionName(templateFunction)
    );

    const privateTemplates = generateFunctions(templateFunction);
    const { inlineTemplates, inlineDependencies } = generateInlineTemplates(
        templateFunction,
        depsIdentifier
    );

    processor.addCodeBlock(getDynamicPropertiesDeclaration(generator));

    processor.addCodeBlock(
        `var __dirtyCheckingVars_ = ${generator.genArrowExpression(
            generator.genStringInterpolation('__dirtyCheckingVars_${id}'),
            ['id']
        )};`
    );

    processor.addCodeBlock(
        'function debug() { debugger; }' +
            `var filename = "${options.modulePath.module}";` +
            `var ${T_HELPERS_NAME} = Executor.TClosure;` +
            'var deps = Array.prototype.slice.call(arguments);' +
            'var depsLocal = { };' +
            'var includedTemplates = { };' +
            'var scopeForTemplate, attrsForTemplate;'
    );

    if (!options.isWasabyTemplate) {
        processor.addCodeBlock(
            TMPL_BLOCK_START +
                'var tclosure=deps[0].TClosure;' +
                'var rk=deps[1];' +
                'var _deps = { };' +
                TMPL_BLOCK_END
        );
    }

    processor.addCodeBlock(
        dependenciesList +
            inlineDependencies +
            privateTemplates +
            inlineTemplates +
            `var templateFunction = ${template};` +
            'templateFunction.stable = true;' +
            `templateFunction.reactiveProps = ${JSON.stringify(reactive)};` +
            `templateFunction.isWasabyTemplate = ${options.isWasabyTemplate};`
    );

    if (!options.isWasabyTemplate) {
        processor.addCodeBlock(
            TMPL_BLOCK_START +
                `templateFunction.toJSON = ${generator.genArrowExpression(
                    `{ $serialized$: "func", module: "${nodeName}" }`
                )};` +
                TMPL_BLOCK_END
        );
    }

    processor.setReturnableExport('templateFunction');
}
