/**
 * @author Krylov M.A.
 *
 * Модуль строителя экспортируемой сущности по мета-описанию скомпилированного шаблона.
 *
 * Поскольку все шаблоны версионируются, из этого модуля можно управлять способом обработки мета-описания шаблона и
 * построения экспортируемой сущности, в зависимости от версии скомпилированного шаблона.
 */

import type { IBuilder, IClosure, IDescription, IExport } from './Interface';
import type { IGlobal, TemplateFunction } from '../core/Interface';

import { IRTemplateBodyType } from '../core/IRTemplateBody';

function prettifyFunctionName(value: string): string {
    return value
        // Remove require substitution
        .replace(/^(wml|tmpl|html)!/g, '')

        // Remove file extension
        .replace(/\.(wml|tmpl|html)$/gi, '')

        // Replace path separator and spaces with underscore
        .replace(/[.\-:/\s]/gi, '_')

        // Remove leading digits at the start
        .replace(/^\d+/gi, '')

        // Remove any invalid characters
        .replace(/[^\d\w_]/gi, '');
}

/**
 * Установить имя шаблонной функции.
 * @param {TemplateFunction} fn Шаблонная функция.
 * @param {string} value Оригинальная шаблонная функция.
 *
 * @fixme Где-то в ядре заточились на имя шаблонной функции, что влияет на перерисовки.
 */
function setFunctionName(fn: TemplateFunction, value: string): void {
    // Не определять новое имя для функции, если дескриптор этого не позволяет
    // В FF36 <#name> configurable/writable есть false
    if (Object.getOwnPropertyDescriptor(fn, 'name')?.configurable) {
        Object.defineProperty(fn, 'name', {
            value: prettifyFunctionName(value),
            configurable: true
        });
    }
}

/**
 * Класс, реализующий метод построения шаблонной функции (экспортируемое значение из модуля)
 * по мета-описанию шаблона.
 *
 * @private
 */
class Builder implements IBuilder {

    /**
     * Построить экспортируемую из шаблона сущность по мета-описанию шаблона.
     * @param {IDescription} description Мета-описание шаблона.
     * @param {IClosure} closure Строитель шаблонных функций.
     */
    build(description: IDescription, closure: IClosure): IExport {
        const properties = description.p ?? [];
        const isWasabyTemplate = description.m.startsWith('wml!');
        const global: IGlobal = {
            version: description.v,
            moduleName: description.m,
            depsLocal: description.d ?? { },
            includedTemplates: { },

            // Критично: порядок функций должен быть идентичным.
            // Индексы используются как ключи для доступа к функциям.
            bodies: [],
            templates: [],
            expressions: description.e ?? [],
            internalsMeta: description.i ?? [],

            isWasabyTemplate
        };

        let root: IExport;
        description.t.forEach((body, index) => {
            const template = closure.createTemplateFunction(global, body);

            // Критично: порядок функций должен быть идентичным.
            // Индексы используются как ключи для доступа к функциям.
            global.bodies.push(body);
            global.templates.push(template);

            switch (body.type) {
                case IRTemplateBodyType.CONTENT:
                    setFunctionName(template, `${body.name}_${index}`);
                    break;

                case IRTemplateBodyType.TEMPLATE:
                    setFunctionName(template, body.name);

                    global.depsLocal[body.name] = template;
                    break;

                case IRTemplateBodyType.ROOT:
                    setFunctionName(template, global.moduleName);

                    root = template as IExport;
                    break;
            }
        });

        if (!root) {
            throw new Error('Ошибка построения шаблона: корневая функция не была сгенерирована');
        }

        root.stable = true;
        root.reactiveProps = properties;
        root.isWasabyTemplate = isWasabyTemplate;

        return root;
    }
}

let builder;
export default function createBuilder(): IBuilder {
    if (!builder) {
        builder = new Builder();
    }

    return builder;
}
