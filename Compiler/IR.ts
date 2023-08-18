/**
 * Точка входа для генерации шаблонных функций по мета-описанию шаблона.
 *
 * @author Krylov M.A.
 */

import type { IDescription, IExport } from './_ir/builder/Interface';
import type { TemplateBody } from './_ir/core/Interface';

import { IRTemplateBody, IRTemplateBodyType } from './_ir/core/IRTemplateBody';
import createBuilder from './_ir/builder/Builder';
import createClosure from './_ir/builder/Closure';

/**
 * Выполнить генерацию шаблонной функции по её мета-описанию.
 * @param {IDescription} description Описание данных шаблона.
 */
export function generate(description: IDescription): IExport {
    return createBuilder()
        .build(description, createClosure());
}

/**
 * Упаковать зависимости для мета описания.
 * @param {string[]} names Массив имен импортируемых в шаблон модулей.
 * @param {*[]} exports Массив экспортов каждого импортируемого модуля.
 */
export function wrapDependencies(names: string[], exports: unknown[]): Record<string, unknown> {
    const dependencies = { };

    names.forEach((name: string, index: number) => (dependencies[name] = exports[index]));

    return dependencies;
}

/**
 * Упаковать тело контентной опции.
 * @param {TemplateBody} body Тело контентной опции, которое генерирует верстку.
 * @param {string?} name Имя контентной опции. По умолчанию используется имя "content".
 */
export function wrapContentBody(body: TemplateBody, name: string = 'content'): IRTemplateBody {
    return new IRTemplateBody(body, IRTemplateBodyType.CONTENT, name);
}

/**
 * Упаковать тело именованного шаблона, заданного через ws:template.
 * @param {string} name Имя шаблона.
 * @param {TemplateBody} body Тело контентной опции, которое генерирует верстку.
 */
export function wrapTemplateBody(name: string, body: TemplateBody): IRTemplateBody {
    return new IRTemplateBody(body, IRTemplateBodyType.TEMPLATE, name);
}

/**
 * Упаковать тело корневого шаблона.
 * @param {TemplateBody} body Тело корневого шаблона, которое генерирует верстку.
 */
export function wrapRootBody(body: TemplateBody): IRTemplateBody {
    return new IRTemplateBody(body, IRTemplateBodyType.ROOT);
}

// Алиасы для компиляции в режиме релиза.
export {
    generate as g,
    wrapDependencies as d,
    wrapContentBody as c,
    wrapTemplateBody as t,
    wrapRootBody as r
};
