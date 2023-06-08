/**
 * @description Предоставляет методы генерации кода для конкретных узлов AST-дерева.
 */

import {
    functionToString,
    getContentOptionName,
    createFunctionString,
    IMainTemplateFunction,
} from './Template';

const EMPTY_STRING = '';

export const DEPRECATED_BLOCK_START = '/*#DELETE IT START#*/';
export const DEPRECATED_BLOCK_END = '/*#DELETE IT END#*/';

const HEAD_TEMPLATE =
    '' +
    DEPRECATED_BLOCK_START +
    'function debug() { debugger; }' +
    'var scopeForTemplate, attrsForTemplate;' +
    'var thelpers = typeof tclosure === "undefined" || !tclosure ? arguments[arguments.length - 1] : tclosure;' +
    'if (typeof thelpers === "undefined" || !thelpers._isTClosure) {' +
    'eval("var thelpers = null;");' +
    'thelpers = (function() {' +
    'return this || (0, eval)("this");' +
    '})().requirejs("UI/Executor").TClosure;' +
    '}' +
    'var depsLocal = typeof _deps === "undefined" ? undefined : _deps;' +
    'if (typeof includedTemplates === "undefined") {' +
    'eval("var includedTemplates = undefined;");' +
    'includedTemplates = (this && this.includedTemplates) ? this.includedTemplates : {};' +
    '}' +
    DEPRECATED_BLOCK_END +
    'var templateCount = 0;' +
    'var key = thelpers.validateNodeKey(attr && attr.key);' +
    'var defCollection = { id: [], def: undefined };' +
    'var viewController = thelpers.calcParent(this, undefined, data);';

/**
 * Выполнить генерацию определений функций для internal-переменных и контентных опций.
 * @param templateFunction {IMainTemplateFunction} Главная шаблонная функция.
 * @returns {string} Блок кода с определениями функций модуля.
 */
export function generateFunctions(
    templateFunction: IMainTemplateFunction
): string {
    let privateTemplates = '';

    if (templateFunction.internalFunctions) {
        for (
            let index = 0;
            index < templateFunction.internalFunctions.length;
            ++index
        ) {
            privateTemplates += templateFunction.internalFunctions[index];
        }
    }

    if (templateFunction.contentOptionFunctions) {
        for (
            let index = 0;
            index < templateFunction.contentOptionFunctions.length;
            ++index
        ) {
            const functionName = getContentOptionName(
                templateFunction.contentOptionFunctions[index],
                index
            );
            const functionBody = functionToString(
                templateFunction.contentOptionFunctions[index],
                functionName
            );
            privateTemplates += functionBody;
        }
    }

    return privateTemplates;
}

/**
 * Выполнить генерацию определений inline-функций.
 * @param templateFunction {IMainTemplateFunction} Главная шаблонная функция.
 * @returns {{ includedTemplates: string, localDependenciesList: string }} Возвращает объект,
 *  содержащий определения inline-функций и установку inline-функций в объект с зависимостями.
 * @param depsIdentifier {string} Имя объекта-хранилища зависимостей. Отличается для tmpl и wml.
 */
export function generateInlineTemplates(
    templateFunction: IMainTemplateFunction,
    depsIdentifier: string
): { inlineTemplates: string; inlineDependencies: string } {
    let inlineTemplates = '';
    let inlineDependencies = '';

    if (templateFunction.inlineTemplateBodies) {
        for (const functionName in templateFunction.inlineTemplateBodies) {
            if (
                templateFunction.inlineTemplateBodies.hasOwnProperty(
                    functionName
                )
            ) {
                inlineTemplates += createFunctionString(
                    functionName,
                    templateFunction.inlineTemplateBodies[functionName]
                );
                inlineDependencies += `${depsIdentifier}["${functionName}"] = ${functionName};`;
            }
        }
    }

    return { inlineTemplates, inlineDependencies };
}

/**
 * Выполнить генерацию кода для неименованных зависимостей.
 * @param deps {string[]} Массив неименованных зависимостей
 * @param dependenciesShift {number} Сдвиг зависимостей в arguments define-функции относительно именованных зависимостей.
 * @param depsIdentifier {string} Имя объекта-хранилища зависимостей. Отличается для tmpl и wml.
 */
export function generateDependenciesList(
    deps: string[],
    dependenciesShift: number,
    depsIdentifier: string
): string {
    let dependenciesList = '';
    for (let index = 0; index < deps.length; ++index) {
        dependenciesList += `${depsIdentifier}["${deps[index]}"] = deps[${
            index + dependenciesShift
        }];`;
    }
    return dependenciesList;
}

/**
 * Получить имя главной шаблонной функции.
 * @param fn {Function} Главная шаблонная функция.
 */
export function getMainTemplateFunctionName(fn: Function): string {
    const name = fn.name;
    if (name === 'anonymous' || name === undefined) {
        return 'template';
    }
    return name;
}

/**
 * Очистить сгенерированный текст шаблона от deprecated-блоков.
 * @param text Сгенерированный текст шаблона.
 * @returns {string} Очищенный текст шаблона.
 */
export function clearSourceFromDeprecated(text: string): string {
    let clearedSource = text;
    let start = clearedSource.indexOf(DEPRECATED_BLOCK_START);
    let end;

    while (start > -1) {
        end = clearedSource.indexOf(DEPRECATED_BLOCK_END);
        clearedSource =
            clearedSource.substr(0, start) +
            clearedSource.substr(end + DEPRECATED_BLOCK_END.length);
        start = clearedSource.indexOf(DEPRECATED_BLOCK_START);
    }

    return clearedSource;
}

function generateReturnValueFunction(value: string): () => string {
    return () => {
        return value;
    };
}

/**
 * Выполнить подстановку переменной с именем контентной опции.
 * @param source Текст шаблона.
 * @param hasVariable Флаг наличия переменной currentPropertyName в тексте шаблона.
 * @return Обработанный текст шаблона.
 */
function replaceContentOptionName(
    source: string,
    hasVariable: boolean = false
): string {
    const pattern = /\/\*#CONFIG__CURRENT_PROPERTY_NAME#\*\//g;

    if (hasVariable) {
        return source.replace(
            pattern,
            generateReturnValueFunction('pName: currentPropertyName,')
        );
    }
    return source.replace(pattern, EMPTY_STRING);
}

/**
 * Сгенерировать define-модуль шаблона wml-шаблона.
 * @param moduleName Имя модуля.
 * @param moduleExtension Расширение шаблона.
 * @param templateFunction Функция шаблона, содержащая contentOptionFunctions, inlineTemplateBodies.
 * @param dependencies Массив зависимостей.
 * @param reactiveProperties Массив имен реактивных свойств.
 * @param hasTranslations Флаг наличия в единице трансляции конструкции локализации.
 * @param isWasabyTemplate Флаг wml шаблона.
 * @returns {string} Сгенерированный текст шаблона.
 */
export function generateDefine(
    moduleName: string,
    moduleExtension: string,
    templateFunction: IMainTemplateFunction,
    dependencies: string[],
    reactiveProperties: string[],
    hasTranslations: boolean,
    isWasabyTemplate: boolean
): string {
    const mainTemplateFunctionName =
        getMainTemplateFunctionName(templateFunction);
    const template = functionToString(
        templateFunction,
        mainTemplateFunctionName
    );

    const depsIdentifier = isWasabyTemplate ? 'depsLocal' : '_deps';
    const privateTemplates = generateFunctions(templateFunction);
    const { inlineTemplates, inlineDependencies } = generateInlineTemplates(
        templateFunction,
        depsIdentifier
    );

    const headDependencies = ['UI/Executor'];
    const parameters = ['Executor'];

    if (hasTranslations) {
        headDependencies.push('i18n!' + moduleName.split('/')[0]);
        parameters.push('rk');
    }

    const dependenciesList = generateDependenciesList(
        dependencies,
        headDependencies.length,
        depsIdentifier
    );
    const finalDependencies = headDependencies.concat(dependencies);
    const nodeName = `${moduleExtension}!${moduleName}`;

    return (
        '' +
        `define('${nodeName}', ${JSON.stringify(
            finalDependencies
        )}, function(${parameters.join(',')}) {` +
        'function debug() { debugger; }' +
        `var filename = "${moduleName}";` +
        'var thelpers = Executor.TClosure;' +
        'var deps = Array.prototype.slice.call(arguments);' +
        'var depsLocal = { };' +
        'var includedTemplates = { };' +
        'var scopeForTemplate, attrsForTemplate;' +
        DEPRECATED_BLOCK_START +
        'var tclosure=deps[0].TClosure;' +
        'var rk=deps[1];' +
        'var _deps = { };' +
        DEPRECATED_BLOCK_END +
        dependenciesList +
        inlineDependencies +
        privateTemplates +
        inlineTemplates +
        `var templateFunction = ${template};` +
        'templateFunction.stable = true;' +
        `templateFunction.reactiveProps = ${JSON.stringify(
            reactiveProperties
        )};` +
        `templateFunction.isWasabyTemplate = ${isWasabyTemplate};` +
        DEPRECATED_BLOCK_START +
        'templateFunction.toJSON = function() {' +
        `return { $serialized$: "func", module: "${nodeName}" };` +
        '};' +
        DEPRECATED_BLOCK_END +
        'return templateFunction;' +
        '});'
    );
}

/**
 * Сгенерировать блок кода для инструкции for (init; test; update).
 * @param init Выражение инициализации.
 * @param test Выражение условия.
 * @param update Выражение обновления.
 * @param processedBlock Тело цикла.
 * @param cycleIndex Уникальный индекс цикла в рамках одной единицы компиляции.
 * @returns {string} Сгенерированный блок кода.
 */
export function generateFor(
    init: string,
    test: string,
    update: string,
    processedBlock: string,
    cycleIndex: string
): string {
    return (
        '' +
        '(function customForTemplate() {' +
        'var out = [];' +
        'data.viewController = viewController || null;' +
        '(function customForTemplateScope() {' +
        'var templateCount = 0,' +
        `contextInput = key + ${cycleIndex},` +
        'itCount = 0;' +
        `for (${init}; ${test}; ${update}) {` +
        'key = contextInput + "_for_" + itCount + "_";' +
        'itCount++;' +
        `var processed = [${processedBlock}];` +
        'out = out.concat(processed);' +
        '}' +
        '}).call(data);' +
        'if (typeof out === "object") {' +
        'Object.defineProperty(out, "for", { value: true, enumerable: false });' +
        '}' +
        'return out;' +
        '})(),'
    );
}

/**
 * Сгенерировать блок кода для инструкции for (key, value in collection).
 * @param scopeArray Выражение итерируемой коллекции.
 * @param forSource Инструкции цикла (key и value).
 * @param processedBlock Тело цикла.
 * @param cycleIndex Уникальный индекс цикла в рамках одной единицы компиляции.
 * @returns {string} Сгенерированный блок кода.
 */
export function generateForeach(
    scopeArray: string,
    forSource: { key: string; value: string },
    processedBlock: string,
    cycleIndex: string
): string {
    const iteratorScope = JSON.stringify({
        key: forSource.key,
        value: forSource.value,
    });

    return (
        '' +
        '(function forTemplate() {' +
        'var iterator = undefined;' +
        'for (var i = 0; i < thelpers.iterators.length && !iterator; i++) {' +
        `if (thelpers.iterators[i].is(${scopeArray})) {` +
        'iterator = thelpers.iterators[i].iterator;' +
        '}' +
        '}' +
        'var out = [];' +
        'data.viewController = viewController || null;' +
        '(function forTemplateScope() {' +
        'var data = thelpers.createScope(this);' +
        'if (iterator) {' +
        'var templateCount = 0,' +
        `contextInput = key + ${cycleIndex},` +
        'itCount = 0;' +
        `iterator(${scopeArray}, function forIteratorCallback(entity, key) {` +
        'var originData = data;' +
        'data = Object.create(data);' +
        `thelpers.presetScope(entity, data, key, ${iteratorScope});` +
        'key = contextInput + "_for_" + itCount + "_";' +
        'itCount++;' +
        `var processed = [${processedBlock}];` +
        'out = out.concat(processed);' +
        'data = originData;' +
        '}.bind(data));' +
        '} else {' +
        'out = markupGenerator.createText("");' +
        '}' +
        '}).call(data);' +
        'if (typeof out === "object") {' +
        'Object.defineProperty(out, "for", { value: true, enumerable: false });' +
        '}' +
        'return out;' +
        '}).call(this),'
    );
}

/**
 * Сгенерировать тело функции шаблона - блок формирования верстки.
 * @param fileName Путь к файлу шаблона.
 * @param markupGeneration Блок генерации верстки.
 * @param hasTranslations Флаг наличия в единице трансляции конструкции локализации.
 * @param appendHeader Флаг, означающий, что необходимо включить заголовок с переменными.
 * @returns {string} Сгенерированный блок кода.
 */
export function generateTemplate(
    fileName: string,
    markupGeneration: string,
    hasTranslations: boolean,
    appendHeader: boolean
): string {
    const header = appendHeader ? HEAD_TEMPLATE : EMPTY_STRING;
    const initRkFunction = hasTranslations
        ? 'var rk = thelpers.getRk(filename);'
        : EMPTY_STRING;

    const source =
        '' +
        'if (typeof forceCompatible === "undefined") {' +
        'forceCompatible = false;' +
        '}' +
        'var shouldCalculateInternal = (isVdom && typeof window !== "undefined");' +
        'var markupGenerator = thelpers.createGenerator(isVdom, forceCompatible, generatorConfig);' +
        'var funcContext = thelpers.getContext(this);' +
        'var scopeForTemplate, attrsForTemplate;' +
        DEPRECATED_BLOCK_START +
        `var filename = "${fileName}";` +
        initRkFunction +
        'funcContext = data;' +
        'if (typeof includedTemplates === "undefined") {' +
        'eval("var includedTemplates = undefined;");' +
        'includedTemplates = (this && this.includedTemplates) ? this.includedTemplates : {};' +
        '}' +
        DEPRECATED_BLOCK_END +
        'try {' +
        `var out = markupGenerator.joinElements([${markupGeneration}], key, defCollection);` +
        'if (defCollection && defCollection.def) {' +
        'out = markupGenerator.chain(out, defCollection, this);' +
        'defCollection = undefined;' +
        '}' +
        '} catch (e) {' +
        'thelpers.templateError(filename, e, data);' +
        '}' +
        'return out || markupGenerator.createText("");';

    if (appendHeader) {
        return header + replaceContentOptionName(source);
    }
    return header + source;
}

/**
 * Сгенерировать тело функции контентной опции.
 * @param propertyName Имя контентной опции.
 * @param templateBody Тело шаблона.
 * @param fileName Путь к файлу шаблона.
 * @param isString Метка: генерировать шаблон для строки или функции.
 * @returns {string} Сгенерированное тело функции контентной опции.
 */
export function generateContentTemplate(
    propertyName: string,
    templateBody: string,
    fileName: string,
    isString: boolean
): string {
    const deprecatedBlock =
        '' +
        'if (typeof context === "undefined") {' +
        'var context = arguments[2];' +
        '}' +
        'if (typeof thelpers === "undefined") {' +
        'eval("var thelpers = null;");' +
        'thelpers = (function() {' +
        'return this || (0, eval)("this");' +
        '})().requirejs("UI/Executor").TClosure;' +
        '}';

    if (isString) {
        const source =
            '' +
            DEPRECATED_BLOCK_START +
            deprecatedBlock +
            DEPRECATED_BLOCK_END +
            'var templateCount = 0;' +
            `var currentPropertyName = "${propertyName}";` +
            templateBody;

        return replaceContentOptionName(source, true);
    }

    const source =
        '' +
        DEPRECATED_BLOCK_START +
        deprecatedBlock +
        'if (sets && sets.isSetts) {' +
        'var contextObj = sets.fullContext || {};' +
        '}' +
        DEPRECATED_BLOCK_END +
        'var templateCount = 0;' +
        `var currentPropertyName = "${propertyName}";` +
        'data = thelpers.isolateScope(Object.create(this), data, currentPropertyName);' +
        'var key = thelpers.validateNodeKey(attr && attr.key);' +
        'var defCollection = { id: [], def: undefined };' +
        'var viewController = thelpers.calcParent(this, currentPropertyName, data);' +
        templateBody;

    return replaceContentOptionName(source, true);
}

/**
 * Сгенерировать контентную опцию для wml шаблона.
 * Полученный блок кода - значение контентной опции в блоке "options".
 * @param template Имя функции контентной опции.
 * @param internal Набор internal выражений.
 * @param postfix Строка, которую необходимо добавить в конце сгенерированного блока.
 * @param isWasabyTemplate Флаг wml шаблона.
 * @returns {string} Значение контентной опции для блока "options".
 */
export function generateContentOption(
    template: string,
    internal: string,
    postfix: string,
    isWasabyTemplate: boolean
): string {
    return (
        '' +
        '{' +
        'func: (function() {' +
        'var scope = Object.create(data);' +
        'scope.viewController = viewController || null;' +
        `var bindFn = ${template}.bind(scope);` +
        DEPRECATED_BLOCK_START +
        'bindFn.toJSON = function() {' +
        `return "TEMPLATEFUNCTOJSON=" + ${template}.toString();` +
        '};' +
        DEPRECATED_BLOCK_END +
        `bindFn.isWasabyTemplate = ${isWasabyTemplate};` +
        'return bindFn;' +
        '})(),' +
        `internal: ${internal},` +
        `isWasabyTemplate: ${isWasabyTemplate}` +
        '}' +
        (postfix || EMPTY_STRING)
    );
}

/**
 * Сгенерировать контентную опцию для tmpl шаблона.
 * Полученный блок кода - значение контентной опции в блоке "options".
 * @param templateBody Тело шаблонной функции.
 * @param internal Набор internal выражений.
 * @param postfix Строка, которую необходимо добавить в конце сгенерированного блока.
 * @param isWasabyTemplate Флаг wml шаблона.
 * @returns {string} Значение контентной опции для блока "options".
 */
export function generateContentOptionTmpl(
    templateBody: string,
    internal: string,
    postfix: string,
    isWasabyTemplate: boolean
): string {
    const source =
        '' +
        '(new(function() {' +
        'var scope = Object.create(data);' +
        'scope.viewController = viewController || null;' +
        `var func = (${templateBody});` +
        'this.func = thelpers.makeFunctionSerializable(func, scope);' +
        `${internal};` +
        `this.func.isWasabyTemplate = ${isWasabyTemplate};` +
        '})).func' +
        (postfix || EMPTY_STRING);

    return replaceContentOptionName(source, true);
}

/**
 * Сгенерировать тело функции inline-шаблона.
 * @param body {string} Тело шаблона.
 * @returns {string} Сгенерированный блок кода.
 */
export function generateInlineTemplate(body: string): string {
    const source =
        '' +
        '{' +
        'var key = thelpers.validateNodeKey(attr && attr.key);' +
        'var templateCount = 0;' +
        'var defCollection = { id: [], def: undefined };' +
        'var viewController = thelpers.calcParent(this, undefined, data);' +
        body +
        '}';

    return replaceContentOptionName(source);
}

/**
 * Сгенерировать тело функции inline-шаблона.
 * @param name {string} Имя шаблона.
 * @param body {string} Тело шаблона.
 * @returns {string} Сгенерированный блок кода.
 */
export function generateInlineTemplateTmpl(name: string, body: string): string {
    const source =
        '' +
        '(function() {' +
        `includedTemplates["${name}"] = (function(data, attr, context, isVdom) {` +
        body +
        '}.bind({ includedTemplates: includedTemplates }));' +
        '})(),';

    return replaceContentOptionName(source);
}

/**
 * Сгенерировать inline-шаблон для tmpl.
 * @param body {string} Тело шаблона.
 * @returns {string} Сгенерированный блок кода.
 */
export function generatePartialTemplate(body: string): string {
    const source =
        '' +
        '(function f2(data, attr) {' +
        'var key = thelpers.validateNodeKey(attr && attr.key);' +
        'var defCollection = { id: [], def: undefined };' +
        body +
        '})';

    return replaceContentOptionName(source);
}
