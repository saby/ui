/**
 * @author Krylov M.A.
 */

import type { IGenerator } from '../generator/Interface';

import { TemplateBody, IContext } from './Interface';

/**
 * Типы функций, для которых нужны обертки.
 */
export enum IRTemplateBodyType {
    /**
     * Тело именованного шаблона, определенного через ws:template.
     */
    TEMPLATE,

    /**
     * Тело контентной опции.
     */
    CONTENT,

    /**
     * Тело корневого шаблона.
     */
    ROOT
}

/**
 * Обертка над телом шаблона.
 *
 * @private
 */
export class IRTemplateBody {

    /**
     * Инициализировать новый инстанс IR функции построения фрагмента шаблона.
     * @param {TemplateBody} fn Функция построения фрагмента шаблона.
     * @param {IRTemplateBodyType} type Тип функции.
     * @param {string?} name Имя функции, в случае если это именованная функция.
     */
    constructor(
        readonly fn: TemplateBody,
        readonly type: IRTemplateBodyType,
        readonly name?: string
    ) { }

    /**
     * Вызвать функцию построения фрагмента шаблона.
     * @param {IGenerator} generator Инстанс генератора, соответствующий типу шаблона и контексту выполнения.
     * @param {IContext} context Текущий контекст выполнения.
     */
    invoke(generator: IGenerator, context: IContext): unknown {
        return this.fn(generator, context);
    }
}
