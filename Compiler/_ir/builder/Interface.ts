/**
 * @author Krylov M.A.
 */

import type { IRTemplateBody } from '../core/IRTemplateBody';
import type { MustacheExpression, TInternalsCollection, TemplateFunction } from '../core/Interface';
import type { IGlobal } from '../core/Interface';

/**
 * Мета-описание данных шаблона.
 *
 * @public
 */
export interface IDescription {

    /**
     * Версия шаблона.
     */
    v: number;

    /**
     * Имя модуля шаблона.
     */
    m: string;

    /**
     * Набор именованных зависимостей шаблона.
     */
    d?: Record<string, unknown>;

    /**
     * Коллекция функций шаблона (контентные опции, именованные шаблоны, корневой шаблон), которые строят верстку.
     * Содержит как минимум 1 шаблон - корневой.
     */
    t: IRTemplateBody[];

    /**
     * Набор реактивных свойств шаблона.
     */
    p?: string[];

    /**
     * Коллекция функий, выполняющих вычисление Mustache-выражений, которые были использованы внутри шаблона.
     * Также здесь содержатся подвыражения, которые необходимо вычислять для internal.
     */
    e?: MustacheExpression[];

    /**
     * Коллекция мета описаний для вычисления internal выражений.
     */
    i?: TInternalsCollection;
}

/**
 * Интерфейс строителя шаблонной функции.
 *
 * @private
 */
export interface IBuilder {

    /**
     * Построить экспортируемую из шаблона сущность по мета-описанию шаблона.
     * @param {IDescription} description Мета-описание шаблона.
     * @param {IClosure} closure Строитель шаблонных функций.
     */
    build(description: IDescription, closure: IClosure): IExport;
}

/**
 * Интерфейс строителя замыканий.
 *
 * @private
 */
export interface IClosure {

    /**
     * Создать публичную шаблонную функцию.
     * @param {IGlobal} global Глобальный контекст шаблона.
     * @param {IRTemplateBody} body Функция-обертка над телом шаблона.
     */
    createTemplateFunction(global: IGlobal, body: IRTemplateBody): TemplateFunction;
}

/**
 * Экспортируемая корневая шаблонная функция.
 *
 * @public
 */
export interface IExport extends TemplateFunction {
    /**
     * Флаг успешной сборки шаблонной функции.
     * Означает, что функция была собрана корректно.
     */
    stable: boolean;

    /**
     * Набор реактивных свойств шаблона.
     */
    reactiveProps: string[];

    /**
     * Опция для Wasaby шаблонов.
     */
    isWasabyTemplate: boolean;

    /**
     * Необязательный метод сериализации части шаблона.
     */
    toJSON?: () => {
        $serialized$: 'func';
        module: string;
    };
}
