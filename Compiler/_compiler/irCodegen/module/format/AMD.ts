/**
 * @author Krylov M.A.
 *
 * Модуль офомрления сгенерированного шаблона в AMD формат.
 */

import Base from './Base';

import { formatNewLine } from '../../generators/Formatter';

const EMPTY_STRING = '';
const COMMA_CHAR = ', ';
const NEW_LINE = '\n';

/**
 * Класс, предназначенный для компиляции модуля в AMD формат.
 *
 * @private
 */
export default class ModuleAMD extends Base {

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
     * @param {string[]} params Массив параметров callback-функции.
     * @returns {string} Код callback функции, используемой в качестве аргумента define-функции.
     * @private
     */
    protected getCallback(params: string[]): string {
        return `function(${params.join(COMMA_CHAR)}) {${this.getCallbackBody()}}`;
    }

    /**
     * Получить тело callback-функции (тело модуля) с экспортируемыми данными.
     * @returns {string} Тело callback-функции (тело модуля).
     * @private
     */
    protected getCallbackBody(): string {
        const body = [];

        if (this.useStrict) {
            body.push(formatNewLine('"use strict";', 1));
            body.push(NEW_LINE);
        }

        if (this.contents.length > 0) {
            body.push(...this.contents.map(line => formatNewLine(line, 1)));
            body.push(NEW_LINE);
        }

        body.push(formatNewLine(this.exportsController.compile(), 1));
        body.push(NEW_LINE);

        return body.join(EMPTY_STRING);
    }
}
