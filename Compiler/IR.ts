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
    const dependencies: Record<string, unknown> = { };

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

function generateEvalText(text: string): string {
    // @ts-ignore
    const [ , index, data] = /^CONTENT_OPTION,(\d+),(.*)$/mi.exec(text);
    const raw = JSON.parse(data);
    const names = raw.n ?? { };

    const declarations = (
        // @ts-ignore
        `var _generate = ${generate.name};\n` +
        // @ts-ignore
        `var _wrapDependencies = ${wrapDependencies.name};\n` +
        // @ts-ignore
        `var _wrapContentBody = ${wrapContentBody.name};\n` +
        // @ts-ignore
        `var _wrapTemplateBody = ${wrapTemplateBody.name};\n` +
        // @ts-ignore
        `var _wrapRootBody = ${wrapRootBody.name};\n` +
        (names.rk ? `var ${names.rk} = requirejs("i18n!${raw.m.replace(/^tmpl!/g, '').split('/')[0]}");\n` : '') +
        (names.defaultContextGetterFunction ? `function ${names.defaultContextGetterFunction}() { return this; }\n` : '') +
        (names.debug ? `function ${names.debug}() { debugger; }\n` : '')
    );
    const description = (
        '{\n'+
            `v: ${raw.v},\n` +
            `m: "${raw.m}",\n` +
            `t: [\n${raw.t.join(',\n')}\n],\n` +
            (raw.p ? `p: ${raw.p},\n` : '') +
            (raw.e ? `e: [\n${raw.e.join(',\n')}\n],\n` : '') +
            (raw.i ? `i: ${raw.i},\n` : '') +
        '}'
    );

    return (`(function() {
        ${declarations}
        const fn = _generate(${description}).templates[Number(${index})];
        
        // Если эта функция - контентная опция внутри заголовка таблицы (например)
        // то там она вызывается от window и уже над Window делаем Object.create в шаблоне
        // на итог - FF ругается, что кто-то трогает объект, который как бы Window,
        // но не Window
        const contentOption = function wrappedRepairedFunction() {
            if (this === window) {
                return fn.apply(undefined, arguments);
            }

            return fn.apply(this, arguments);
        };

        // Пометим функцию, как ту, что пришла с сервера
        contentOption.fromSerializer = true;

        return contentOption;
    })()`);
}

/**
 * Десериализовать контентную опцию.
 * @param {string} text Сериализованное состояние шаблона tmpl.
 */
export function deserialize(text: string): Function {
    try {
        // eslint-disable-next-line no-eval
        return eval(generateEvalText(text));
    } catch (error) {
        throw new Error(
            `Ошибка десериализации шаблона: ${error.message}\n` +
            `${error.stack}\n` +
            `Данные: text=${text}\n`
        );
    }
}

// Алиасы для компиляции в режиме релиза.
export {
    generate as g,
    wrapDependencies as d,
    wrapContentBody as c,
    wrapTemplateBody as t,
    wrapRootBody as r
};
