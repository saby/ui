/**
 */

import { Config } from 'Compiler/Config';

const ANONYMOUS_STR = 'anonymous';

/**
 * Список параметров шаблонной функции.
 */
const TEMPLATE_FUNCTION_PARAMETERS = [
    'data',
    'attr',
    'context',
    'isVdom',
    'sets',
    'forceCompatible',
    'generatorConfig',
];

const _TFP_STR = TEMPLATE_FUNCTION_PARAMETERS.join(',');

/**
 * Интерфейс главной шаблонной функции.
 */
export interface IMainTemplateFunction extends Function {
    /**
     * Массив internal-функций.
     */
    internalFunctions: Function[];

    /**
     * Массив контентных опций.
     */
    contentOptionFunctions: Function[];

    /**
     * Массив inline-шаблонов.
     */
    inlineTemplateBodies: {
        [name: string]: string;
    };
}

/**
 * Создать шаблонную функцию.
 * @param body {string} Тело шаблонной функции.
 */
export function createFunction(body: string): Function {
    return new Function(_TFP_STR, body);
}

/**
 * Создать шаблонную функцию с заданным именем и телом.
 * @param name {string} Имя шаблонной функции.
 * @param body {string} Тело шаблонной функции.
 * @returns {string} Строковое представление шаблонной функции.
 */
export function createFunctionString(name: string, body: string): string {
    const fn = createFunction(body);
    return functionToString(fn, name);
}

/**
 * Привести функцию к строке, задав ей необходимое имя.
 * @param fn {Function} Шаблонная функция.
 * @param name {string} Необходимое имя для функции.
 * @returns {string} Функция, приведенная к строке.
 */
export function functionToString(
    fn: Function,
    name: string = ANONYMOUS_STR
): string {
    return fn
        .toString()
        .replace('function ' + ANONYMOUS_STR, `function ${name}`);
}

/**
 * Получить имя контентной опции.
 * @param func {Function} Шаблонная функция контентной опции.
 * @param index {number} Индекс контентной опции.
 * @returns {string} Имя контентной опции.
 */
export function getContentOptionName(func, index): string {
    const functionName = func.name;
    if (typeof functionName === 'string' && functionName !== ANONYMOUS_STR) {
        return functionName;
    }
    if (index === 0) {
        return Config.privateFunctionName;
    }
    return Config.privateFunctionName + '_' + index;
}
