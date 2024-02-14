/**
 * @author Krylov M.A.
 */

import type { IContext, TMustache, TemplateBody } from '../../core/Interface';
import type { IPrivateGenerator } from '../Interface';

import getIterator from './Iterators';

/**
 * Define special iterator property on array as a flag of generated nodes in cycle.
 * @param {object} value Collection of generated nodes.
 */
function defineIteratorProperty(value: object): void {
    if (typeof value === 'object') {
        Object.defineProperty(value, 'for', {
            value: true,
            enumerable: false
        });
    }
}

/**
 * Класс, реализующий логику работы с циклами for и foreach.
 *
 * @public
 */
export default class Iterator {

    /**
     * Инициализировать новый инстанс сущности, позволяющей работать с циклами.
     * @param {IGenerator} generator Текущий генератор, с которым строится тело узла условной цепочки.
     * @param {IContext} context Текущий контекст, который содержит Mustache-выражения условных выражений.
     */
    constructor(
        private readonly generator: IPrivateGenerator,
        private readonly context: IContext
    ) { }

    /**
     * Выполнить цикл.
     * @param {number} id Уникальный индекс цикла в пределах одного шаблона.
     * @param {TMustache?} init Необязательный индекс выражения, инициализирующего цикл.
     * @param {TMustache} test Индекс выражения, проверяющего условие для вычисления тела цикла.
     * @param {TMustache?} update Необязательный индекс выражения, которое необходимо вычислять после вычисления блока.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    for(
        id: number,
        init: TMustache,
        test: TMustache,
        update: TMustache,
        body: TemplateBody
    ): unknown[] {
        let out = [];

        const context = this.context.spawn();
        context.self = context.data as Record<string, unknown>;
        context.data.viewController = this.context.viewController || null;
        context.templateCount = 0;

        const contextInput = `${context.key}_${id}`;
        let itCount = 0;

        if (typeof init === 'number') {
            this.generator.evalExpression(context, init);
        }

        while (this.generator.evalExpression(context, test)) {
            context.key = `${contextInput}_for_${itCount++}_`;

            out = out.concat(body(this.generator, context));

            if (typeof update === 'number') {
                this.generator.evalExpression(context, update);
            }
        }

        defineIteratorProperty(out);

        return out;
    }

    /**
     * Выполнить цикл.
     * @param {number} id Уникальный индекс цикла в пределах одного шаблона.
     * @param {string[]} identifiers Имена идентификаторов цикла.
     * @param {TMustache} collection Итерируемая коллекция.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    foreach(
        id: number,
        identifiers: string[],
        collection: TMustache,
        body: TemplateBody
    ): unknown[] {
        let out = [];

        const iterable = this.generator.evalExpression(this.context, collection);
        const iterator = getIterator(iterable);

        const context = this.context.spawn();
        context.data.viewController = this.context.viewController || null;

        if (iterator) {
            context.self = context.data as Record<string, unknown>;
            context.data = this.generator.methods.createScope(context.self);
            context.templateCount = 0;

            const contextInput = `${context.key}_${id}`;
            let itCount = 0;

            iterator(iterable, (entity: unknown, key: number | string) => {
                const data = context.data;

                context.data = Object.create(context.data);

                this.generator.methods.presetScope(entity, context.data, key, {
                    // iterator name
                    value: identifiers[0],

                    // index name
                    key: identifiers[1]
                });

                context.key = `${contextInput}_for_${itCount++}_`;

                out = out.concat(body(this.generator, context));

                context.data = data;
            });
        } else {
            out.push(this.generator.createText(''));
        }

        defineIteratorProperty(out);

        return out;
    }
}
