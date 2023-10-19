/**
 * @author Krylov M.A.
 */

import type {
    IComponentConfiguration,
    IElementConfiguration,
    IPrivateInternalGenerator,
    TControlMethod,
    IInternalCollection
} from '../Interface';

import type { IContext, TemplateBody, TMustache } from '../../core/Interface';
import type { IDataArray } from '../../methods/Interface';

import Base from './Base';
import Chain from '../flow/Chain';
import Methods from 'Compiler/_ir/methods/impl/Internal';
import { InternalController } from '../flow/Controller';

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
export default class Internal extends Base implements IPrivateInternalGenerator {

    private excluded: Map<number, number>;
    private internal: Record<string, unknown>;

    /**
     * Инициализировать новый инстанс калькулятора internal выражений.
     */
    constructor() {
        super(new Methods(), new InternalController());
    }

    /**
     * Вычислить набор internal выражений для узла типа компонент.
     * @param {IContext} context Контекст выполнения.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    evalComponentInternal(context: IContext, internalsMetaId?: number): IInternalCollection {
        if (!shouldEvalInternal(context)) {
            return { };
        }

        this.internal = { };

        // FIXME: ранее при вычислении internal в качестве funcContext использовался data.
        //  Сохраним это поведение и здесь, чтобы вдруг не пропали перерисовки.
        const intContext = context.spawn();
        intContext.funcContext = intContext.data;

        this.excluded = new Map<number, number>();

        // Critical! На корневых узлах excluded не вычисляем
        this.evalIncluded(intContext, internalsMetaId);

        return this.internal;
    }

    /**
     * Вычислить набор internal выражений для узла типа компонент.
     * @param {IContext} context Контекст выполнения.
     * @param {number} content Идентификатор контентной опции.
     * @param {number?} internalsMetaId Указатель на запись в таблице internals,
     * с информацией о том, какие выражения нужно дополнительно посчитать или исключить
     * из вычисления набора internal выражений.
     */
    evalContentOptionInternal(context: IContext, content: number, internalsMetaId?: number): IInternalCollection {
        if (!shouldEvalInternal(context)) {
            return { };
        }

        this.internal = { };

        // FIXME: ранее при вычислении internal в качестве funcContext использовался data.
        //  Сохраним это поведение и здесь, чтобы вдруг не пропали перерисовки.
        const intContext = context.spawn();
        intContext.funcContext = intContext.data;

        this.excluded = new Map<number, number>();

        // Critical! На корневых узлах excluded не вычисляем
        this.evalIncluded(intContext, internalsMetaId);

        intContext.global.bodies[content].invoke(this, intContext);

        return this.internal;
    }

//# region implementation of interface INodeGenerator

    escape(context: IContext, value: unknown): void { }

    createText(context: IContext, text: string, key?: string): void { }

    createDirective(context: IContext, text: string): void { }

    createComment(context: IContext, text: string): void { }

    createTag(context: IContext, name: string, configuration: IElementConfiguration, children: unknown[]): void { }

    createControl(context: IContext, method: TControlMethod, configuration: IComponentConfiguration): void {
        // На узлах этого типа не может быть excluded данных.
        this.evalIncluded(context, configuration.i);
    }

    createPartial(context: IContext, method: unknown, configuration: IComponentConfiguration): void {
        // На узлах этого типа не может быть excluded данных.
        this.evalIncluded(context, configuration.i);
    }

    createTemplate(context: IContext, method: string, configuration: IComponentConfiguration): void {
        // На узлах этого типа не может быть excluded данных.
        this.evalIncluded(context, configuration.i);
    }

    createInline(context: IContext, referenceId: number, configuration: IComponentConfiguration): void {
        this.evalIncluded(context, configuration.i);

        this.enterExcluded(context, configuration.i);
        context.global.bodies[referenceId].invoke(this, context);
        this.leaveExcluded(context, configuration.i);
    }

//# endregion

//# region implementation of interface IGenerator

    evalDefaultScope(context: IContext, options: Record<string, unknown>): void { }

    evalOptionsScope(context: IContext, options: Record<string, unknown>, scope: object): void { }

    evalScope(context: IContext, options: Record<string, unknown>, scope: object): void { }

    evalExpression(context: IContext, expression: TMustache): unknown {
        if (this.excluded.has(expression)) {
            return undefined;
        }

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
            this.internal.__UNREACHABLE_GETTER_PATH__ = true;
        } finally {
            this.internal[`${INTERNAL_PROPERTY_PREFIX}${expression}`] = value;
        }

        return value;
    }

    closeExpression(context: IContext, expression: TMustache): Function {
        return undefined;
    }

    closeBindExpression(context: IContext, expression: TMustache): Function {
        return undefined;
    }

    createContentOption(context: IContext, content: number, internalsMetaId?: number): IDataArray {
        this.evalIncluded(context, internalsMetaId);

        this.enterExcluded(context, internalsMetaId);
        context.global.bodies[content].invoke(this, context);
        this.leaveExcluded(context, internalsMetaId);

        return undefined;
    }

    evalContentOption(context: IContext, content: number, internalsMetaId?: number): unknown {
        // TODO: это работает только в tmpl шаблонах
        return undefined;
    }

    createFunction(context: IContext, name: string, data: object): void { }

    if(context: IContext, test: number, body: TemplateBody): Chain {
        return new Chain(this.chainController.clone(), this, context)
            .if(test, body);
    }

    for(
        context: IContext,
        id: number,
        init: number,
        test: number,
        update: number,
        body: TemplateBody,
        internalsMetaId?: number
    ): unknown[] {
        this.evalIncluded(context, internalsMetaId);

        this.enterExcluded(context, internalsMetaId);
        body(this, context);
        this.leaveExcluded(context, internalsMetaId);

        return undefined;
    }

    foreach(
        context: IContext,
        id: number,
        identifiers: string[],
        collection: number,
        body: TemplateBody,
        internalsMetaId?: number
    ): unknown[] {
        this.evalIncluded(context, internalsMetaId);

        this.evalExpression(context, collection);

        this.enterExcluded(context, internalsMetaId);
        body(this, context);
        this.leaveExcluded(context, internalsMetaId);

        return undefined;
    }

//# endregion

//# region implementation of interface IPrivateGenerator

    prepareDataForCreate(tpl: unknown, scope: unknown, attributes: unknown, deps: unknown): void { }

//# endregion

    private evalIncluded(context: IContext, internalsMetaId?: number): void {
        if (typeof internalsMetaId !== 'number') {
            return;
        }

        const [include] = context.global.internalsMeta[internalsMetaId];

        include.forEach(expression => this.evalExpression(context, expression));
    }

    private enterExcluded(context: IContext, internalsMetaId?: number): void {
        if (typeof internalsMetaId !== 'number') {
            return;
        }

        const [ , exclude] = context.global.internalsMeta[internalsMetaId];

        exclude.forEach((expression) => {
            const amount = this.excluded.get(expression) ?? 0;

            this.excluded.set(expression, amount + 1);
        });
    }

    private leaveExcluded(context: IContext, internalsMetaId?: number): void {
        if (typeof internalsMetaId !== 'number') {
            return;
        }

        const [ , exclude] = context.global.internalsMeta[internalsMetaId];

        exclude.forEach((expression) => {
            const amount = this.excluded.get(expression) ?? 1;

            if (amount === 1) {
                this.excluded.delete(expression);

                return;
            }

            this.excluded.set(expression, amount - 1);
        });
    }
}
