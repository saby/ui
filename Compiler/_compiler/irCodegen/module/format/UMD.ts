/**
 * @author Krylov M.A.
 *
 * Модуль офомрления сгенерированного шаблона в UMD формат.
 */

import AMD from './AMD';

import { formatNewLine } from '../../generators/Formatter';

const EMPTY_STRING = '';
const COMMA_CHAR = ', ';
const DUMMY_RK_NAME = 'rk';
const DEP_VAR_PREFIX = 'reqModule_';
const REQUIRE_NAME = 'global.requirejs';

const DUMMY_RK_FUNCTION = (`
        var ${DUMMY_RK_NAME} = function(key) {
            return key;
        };\
`);

const toDependenciesBlock = (moduleName: string, initIdentifiers: string[], dependencies: string[]) => (`
        var ${initIdentifiers.join(COMMA_CHAR)};
        try {${dependencies.join(EMPTY_STRING)}
        } catch (error) {
            throw new Error("Ошибка загрузки модулей в шаблоне '${moduleName}': " + error);
        }\
`);

const toFactoryBlock = (amdArgs: string[], umdArgs: string[], depsLoadingBlock: string) => (`function(factory) {
    if (typeof define === "function" && define.amd) {
        define(${amdArgs.join(COMMA_CHAR)});
    } else if (typeof module === "object" && typeof module.exports === "object") {${depsLoadingBlock}
        var v = factory(${umdArgs.join(COMMA_CHAR)});
        if (v !== undefined)
            module.exports = v;
    }
}`);

/**
 * Класс, предназначенный для компиляции модуля в UMD формат.
 *
 * @private
 */
export default class ModuleUMD extends AMD {
    /**
     * Выполнить компиляцию модуля.
     * @returns {string} JavaScript код модуля.
     */
    compile(): string {
        const [deps, names] = this.dependenciesController.getDependencies();
        const factory = this.getFactory(deps);
        const callback = this.getCallback(names);

        return `(${factory})(${callback});`;
    }

    /**
     * Получить заголовочник UMD модуля, выполняющий вызов factory-функции или define-функции.
     * @param {string[]} dependencies Коллекция зависимостей шаблона.
     * @returns {string} Заголовочник UMD модуля.
     */
    private getFactory(dependencies: string[]): string {
        const initIdentifiers: string[] = [];
        const loadingDeps: string[] = [];
        let needRk = false;

        const umdArguments = dependencies.map((dependency: string, index: number) => {
            const plugins = dependency.split('!');
            const dependencyName = plugins.pop();

            const hasWml = plugins.includes('wml');
            const hasTmpl = plugins.includes('tmpl');

            if (plugins.includes('js') || hasWml || hasTmpl || plugins.length === 0) {
                const id = DEP_VAR_PREFIX + index;
                const postfix = hasWml ? '.wml' : hasTmpl ? '.tmpl' : EMPTY_STRING;

                initIdentifiers.push(id);
                loadingDeps.push(
                    formatNewLine(`${id} = ${REQUIRE_NAME}(${JSON.stringify(dependencyName + postfix)});`, 3)
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
        });

        const amdArguments = [];

        if (this.name) {
            amdArguments.push(JSON.stringify(this.name));
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
            depsLoadingBlock += toDependenciesBlock(this.name, initIdentifiers, loadingDeps);
        }

        return toFactoryBlock(amdArguments, umdArguments, depsLoadingBlock);
    }
}
