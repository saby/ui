/**
 * @author Krylov M.A.
 */

import type { IPrivateInternalGenerator, IInternalCollection } from '../Interface';
import type { IContext, TMustache } from '../../core/Interface';

import Methods from 'Compiler/_ir/methods/impl/Internal';

const INTERNAL_PROPERTY_PREFIX = '__dirtyCheckingVars_';

/**
 * Проверить, необходимо ли вычислять internal коллекцию.
 * @param {IContext} context Контекст выполнения.
 */
function shouldEvalInternal(context: IContext): boolean {
    return context.args.isVdom && typeof window !== 'undefined';
}

/**
 * Класс, реализующий методы вычисления internal выражений.
 *
 * @private
 */
export default class Internal implements IPrivateInternalGenerator {
    private readonly methods: Methods;

    /**
     * Инициализировать новый инстанс калькулятора internal выражений.
     */
    constructor() {
        this.methods = new Methods();
    }

    /**
     * Вычислить набор internal.
     * @param {IContext} context Контекст выполнения.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    evalInternal(context: IContext, internalsMetaId?: number): IInternalCollection {
        if (!shouldEvalInternal(context) || typeof internalsMetaId !== 'number') {
            return { };
        }

        const internal = { };

        // FIXME: ранее при вычислении internal в качестве funcContext использовался data.
        //  Сохраним это поведение и здесь, чтобы вдруг не пропали перерисовки.
        const intContext = context.spawn();
        intContext.funcContext = intContext.data;

        intContext.global.internalsMeta[internalsMetaId].forEach((range) => {
            const end = range[1] ?? range[0];

            for (let expression = range[0]; expression <= end; expression++) {
                this.evalExpression(intContext, internal, expression);
            }
        });

        return internal;
    }

    private evalExpression(context: IContext, internal: Record<string, unknown>, expression: TMustache): unknown {
        let value;
        try {
            value = context.global.expressions[expression].call(
                context.self,
                this.methods,
                context.data,
                context.funcContext,
                context.args.context,
                context.self?._children
            );
        } catch (error) {
            internal.__UNREACHABLE_GETTER_PATH__ = true;
        } finally {
            internal[`${INTERNAL_PROPERTY_PREFIX}${expression}`] = value;
        }

        return value;
    }
}
