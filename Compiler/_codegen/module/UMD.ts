/**
 */

import { Base } from './Base';

const EMPTY_STRING = '';
const COMMA_CHAR = ',';
const DUMMY_RK_NAME = 'rk';
const DUMMY_RK_FUNCTION = `var ${DUMMY_RK_NAME} = function(key) { return key; };`;
const DEP_VAR_PREFIX = 'reqModule_';
const REQUIRE_NAME = 'global.requirejs';

/**
 * Получить заголовочник UMD модуля, выполняющий вызов factory-функции или define-функции.
 * @param moduleName {string} Имя модуля шаблона.
 * @param dependencies {string[]} Коллекция зависимостей шаблона.
 * @returns {string} Заголовочник UMD модуля.
 */
function getFactory(moduleName: string, dependencies: string[]): string {
    const initIdentifiers = [];
    const loadingDeps = [];
    let needRk = false;

    const umdArguments = dependencies.map(
        (dependency: string, index: number) => {
            const plugins = dependency.split('!');
            const dependencyName = plugins.pop();

            const hasWml = plugins.includes('wml');
            const hasTmpl = plugins.includes('tmpl');

            if (
                plugins.includes('js') ||
                hasWml ||
                hasTmpl ||
                plugins.length === 0
            ) {
                const id = DEP_VAR_PREFIX + index;
                const postfix = hasWml
                    ? '.wml'
                    : hasTmpl
                    ? '.tmpl'
                    : EMPTY_STRING;

                initIdentifiers.push(id);
                loadingDeps.push(
                    `${id} = ${REQUIRE_NAME}(${JSON.stringify(
                        dependencyName + postfix
                    )});`
                );
                return id;
            }

            if (plugins.includes('i18n')) {
                needRk = true;
                return DUMMY_RK_NAME;
            }

            if (plugins.includes('css')) {
                return '""';
            }

            return 'undefined';
        }
    );

    const amdArguments = [];

    if (moduleName) {
        amdArguments.push(JSON.stringify(moduleName));
    }
    if (dependencies.length > 0) {
        amdArguments.push(JSON.stringify(dependencies));
    }
    amdArguments.push('factory');

    let depsLoadingBlock = EMPTY_STRING;
    if (needRk) {
        depsLoadingBlock += DUMMY_RK_FUNCTION;
    }
    if (loadingDeps.length > 0) {
        depsLoadingBlock +=
            EMPTY_STRING +
            `var ${initIdentifiers.join(COMMA_CHAR)};` +
            'try {' +
            loadingDeps.join(EMPTY_STRING) +
            '} catch (error) {' +
            `throw new Error("Ошибка загрузки модулей в шаблоне '${moduleName}': " + error);` +
            '}';
    }

    return (
        '' +
        'function(factory) {' +
        'if (typeof define === "function" && define.amd) {' +
        `define(${amdArguments.join(COMMA_CHAR)});` +
        '} else if (typeof module === "object" && typeof module.exports === "object") {' +
        depsLoadingBlock +
        `var v = factory(${umdArguments.join(COMMA_CHAR)});` +
        'if (v !== undefined)' +
        'module.exports = v;' +
        '}' +
        '}'
    );
}

/**
 * Класс, предназначенный для компиляции модуля в UMD формат.
 */
export default class ModuleUMD extends Base {
    /**
     * Инициализировать инстанс процессора модуля в UMD формат.
     */
    constructor() {
        super();
    }

    /**
     * Выполнить компиляцию модуля.
     * @returns {string} JavaScript код модуля.
     */
    compile(): string {
        const [deps, names] = this.dependenciesController.getDependencies();
        const factory = getFactory(this.name, deps);
        const callback = this.getCallback(names);

        return `(${factory})(${callback});`;
    }

    /**
     * Получить код callback функции, используемой в качестве factory-функции.
     * @param params {string[]} Массив параметров factory-функции.
     * @returns {string} callback функция, используемая в качестве factory-функции.
     * @private
     */
    private getCallback(params: string[]): string {
        const strict = this.useStrict ? '"use strict";' : EMPTY_STRING;
        const body = this.getCallbackBody();

        return `function(${params.join(COMMA_CHAR)}){${strict + body}}`;
    }

    /**
     * Получить тело callback-функции (тело модуля) с экспортируемыми данными.
     * @returns {string} Тело callback-функции (тело модуля).
     * @private
     */
    private getCallbackBody(): string {
        return this.code.join(EMPTY_STRING) + this.exportsController.compile();
    }
}
