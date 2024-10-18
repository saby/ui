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
 * Сериализованное состояние шаблона контентной опции.
 */
interface ISerializedState {
    /**
     * Версия шаблона.
     */
    v: number;

    /**
     * Модуль шаблона.
     */
    m: string;

    /**
     * Список шаблонных функций.
     */
    t: string[];

    /**
     * Список реактивных свойств.
     */
    p: string;

    /**
     * Таблица выражений.
     */
    e: string[];

    /**
     * Таблица internal выражений.
     */
    i: string;

    /**
     * Коллекция внутренних имен.
     */
    n: {
        rk?: string,
        defaultContextGetterFunction?: string,
        debug?: string
    };
}

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

/**
 * Создать блок десериализации шаблона контентной опции.
 * @param {ISerializedState} state Сериализованное состояние шаблона.
 * @param {number} index Индекс контентной опции, которую необходимо построить.
 */
function createSourceText(state: ISerializedState, index: number): string {
    const serializedDeclarations = (
        (state.n.rk ? `var ${state.n.rk} = requirejs("i18n!${state.m.replace(/^tmpl!/g, '').split('/')[0]}");\n` : '') +
        (state.n.defaultContextGetterFunction ? `function ${state.n.defaultContextGetterFunction}() { return this; }\n` : '') +
        (state.n.debug ? `function ${state.n.debug}() { debugger; }\n` : '')
    );

    const description = (
        '{\n'+
        `v: ${state.v},\n` +
        `m: "${state.m}",\n` +
        `t: [\n${state.t.join(',\n')}\n],\n` +
        (state.p ? `p: ${state.p},\n` : '') +
        (state.e ? `e: [\n${state.e.join(',\n')}\n],\n` : '') +
        (state.i ? `i: ${state.i},\n` : '') +
        '}'
    );

    return (`(function() {
        ${serializedDeclarations}
        var meta = ${description};
        var fn = _Compiler_IR.generate(meta).templates[Number(${index})];
        
        // Если эта функция - контентная опция внутри заголовка таблицы (например)
        // то там она вызывается от window и уже над Window делаем Object.create в шаблоне
        // на итог - FF ругается, что кто-то трогает объект, который как бы Window,
        // но не Window
        var contentOption = function wrappedRepairedFunction() {
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
        // @ts-ignore
        const [ , index, data] = /^CONTENT_OPTION,(\d+),(.*)$/mi.exec(text);
        const state: ISerializedState = JSON.parse(data);

        state.n = state.n ?? { };

        // Во избежание конфликта, когда
        // используемые функции из баблиотеки Compiler/IR и
        // используемые сериализованные функции (rk, defaultContextGetterFunction)
        // имеют одно и то же минифицированное имя, необходимо разделять методы при динамической генерации кода:
        // Сначала определяем переменную _Compiler_IR и вычисляем связанные методы библиотеки Compiler/IR,
        // и только после этого в отдельном eval-блоке выполняем определение переменных из сериализованных функций.
        const declarations = (
            'var _Compiler_IR = {\n' +
            `   generate: ${generate.name},\n`+
            `   wrapTemplateBody: ${wrapTemplateBody.name},\n`+
            `   wrapContentBody: ${wrapContentBody.name},\n`+
            `   wrapRootBody: ${wrapRootBody.name}\n`+
            '};' +

            // Для совместимости оставляем ссылки на старые методы десериализации,
            // если придет сериализованное состояние старого шаблона.
            `var _wrapContentBody = ${wrapContentBody.name};\n` +
            `var _wrapTemplateBody = ${wrapTemplateBody.name};\n` +
            `var _wrapRootBody = ${wrapRootBody.name};\n`
        );

        // eslint-disable-next-line no-eval
        eval(declarations);

        // eslint-disable-next-line no-eval
        return eval(createSourceText(state, index));
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
