/**
 */

import { Base } from './Base';

const EMPTY_STRING = '';
const COMMA_CHAR = ',';

/**
 * Класс, предназначенный для компиляции модуля в AMD формат.
 */
export default class ModuleAMD extends Base {
    /**
     * Инициализировать инстанс процессора модуля в AMD формат.
     */
    constructor() {
        super();
    }

    /**
     * Выполнить компиляцию модуля.
     * @returns {string} JavaScript код модуля.
     */
    compile(): string {
        const args = [];
        if (this.name) {
            args.push(`'${this.name}'`);
        }

        const [deps, names] = this.dependenciesController.getDependencies();
        if (deps.length > 0) {
            args.push(JSON.stringify(deps));
        }

        const callback = this.getCallback(names);
        args.push(callback);

        return `define(${args.join(COMMA_CHAR)});`;
    }

    /**
     * Получить код callback функции, используемой в качестве аргумента define-функции.
     * @param params {string[]} Массив параметров callback-функции.
     * @returns {string} Код callback функции, используемой в качестве аргумента define-функции.
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
