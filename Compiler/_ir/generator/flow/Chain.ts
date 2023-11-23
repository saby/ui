/**
 * @author Krylov M.A.
 */

import type { IController } from './Controller';
import type { IContext, TemplateBody, TMustache } from '../../core/Interface';
import type { IGenerator, IPrivateChain } from '../Interface';

enum State {
    /**
     * Узлы условной цепочки еще не выполнялись.
     */
    NONE,

    /**
     * Был выполнен узел if. Следующие возможные узлы: elif, else, fi.
     */
    IF,

    /**
     * Был выполнен узел elif. Следующие возможные узлы: elif, else, fi.
     */
    ELIF,

    /**
     * Был выполнен узел else. Следующие возможные узлы: fi.
     */
    ELSE,

    /**
     * Терминальное состояние условной цепочки.
     */
    FI,
}

/**
 * Класс, реализующий цепочку условных выражений вида
 * <pre>
 * if (test) {
 *     body
 * } elif (test) {
 *     body
 * } else {
 *     body
 * } fi
 * </pre>
 *
 * С помощью контроллера позволяет управлять потоком вычисления:
 * - можно вычислять по порядку test выражения пока одно из них не окажется истинным,
 * и выполнить тело соответствующего узла;
 * - можно вычислить по порядку все test выражения и все body.
 *
 * @public
 */
export default class Chain implements IPrivateChain {
    private readonly result: unknown[];

    private state: State;

    /**
     * Инициализировать новый инстанс цепочки условных выражений.
     * @param {IController} controller Контроллер, определяющий правила обхода условной цепочки.
     * @param {IGenerator} generator Текущий генератор, с которым строится тело узла условной цепочки.
     * @param {IContext} context Текущий контекст, который содержит Mustache-выражения условных выражений.
     * @param {*?} defaultAlternateValue Значение по умолчанию, если ни один из блоков не отработал.
     */
    constructor(
        private readonly controller: IController,
        private readonly generator: IGenerator,
        private readonly context: IContext,
        private readonly defaultAlternateValue: unknown = undefined
    ) {
        this.controller = controller;
        this.generator = generator;
        this.context = context;
        this.defaultAlternateValue = defaultAlternateValue;
        this.result = [];

        this.state = State.NONE;
    }

    i(test: TMustache, body: TemplateBody): this {
        return this.elif(test, body);
    }

    e(body: TemplateBody): this {
        return this.else(body);
    }

    f(): unknown[] {
        return this.fi();
    }

    /**
     * Вычислить узел if условной цепочки.
     * @param {TMustache} test Идентификатор Mustache-выражения.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    if(test: TMustache, body: TemplateBody): this {
        this.updateState(State.IF);

        if (this.controller.testIf(this.generator, this.context, test)) {
            this.result.push(body(this.generator, this.context));
        }

        return this;
    }

    /**
     * Вычислить узел elif условной цепочки.
     * @param {TMustache} test Идентификатор Mustache-выражения.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    elif(test: TMustache, body: TemplateBody): this {
        this.updateState(State.ELIF);

        if (this.controller.testIf(this.generator, this.context, test)) {
            this.result.push(body(this.generator, this.context));
        }

        return this;
    }

    /**
     * Вычислить узел else условной цепочки.
     * @param {TemplateBody} body Функция построения фрагмента шаблона.
     */
    else(body: TemplateBody): this {
        this.updateState(State.ELSE);

        if (this.controller.testElse()) {
            this.result.push(body(this.generator, this.context));
        }

        return this;
    }

    /**
     * Завершить выполнение условной цепочки и получить результат.
     */
    fi(): unknown[] {
        this.updateState(State.FI);

        if (!this.controller.fired && this.defaultAlternateValue !== undefined) {
            this.result.push(this.defaultAlternateValue);
        }

        return this.result;
    }

    /**
     * Установить новое состояние выполнения условной цепочки.
     * @param {State} state Новое состояние.
     */
    private updateState(state: State): void {
        if (state === State.IF) {
            if (this.state !== State.NONE) {
                throw new Error(
                    'Неверный порядок выполнения условной цепочки: if должен быть первым и может быть вызван только один раз'
                );
            }

            this.state = state;

            return;
        }

        if (state === State.ELIF) {
            if (this.state !== State.IF && this.state !== State.ELIF) {
                throw new Error(
                    'Неверный порядок выполнения условной цепочки: elif следует после if или elif'
                );
            }

            this.state = state;

            return;
        }

        if (state === State.ELSE) {
            if (this.state !== State.IF && this.state !== State.ELIF) {
                throw new Error(
                    'Неверный порядок выполнения условной цепочки: else следует после if или elif и может быть вызван только один раз'
                );
            }

            this.state = state;

            return;
        }

        if (state === State.FI) {
            if (this.state !== State.IF && this.state !== State.ELIF && this.state !== State.ELSE) {
                throw new Error(
                    'Неверный порядок выполнения условной цепочки: fi следует после if, elif или else и может быть вызван только один раз'
                );
            }

            this.state = state;

            return;
        }
    }
}
