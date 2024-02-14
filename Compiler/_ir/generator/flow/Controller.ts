/**
 * @author Krylov M.A.
 */

import type { IGenerator } from '../Interface';
import type { IContext, TMustache } from '../../core/Interface';

/**
 * Интерфейс контроллера условной цепочки.
 *
 * @private
 */
export interface IController {

    /**
     * Опция для обозначения, что хотя бы один из блоков условной цепочки отработал.
     */
    readonly fired: boolean;

    /**
     * Определить необходимость вычисления тела if, elif узлов.
     * @param {IGenerator} generator Текущий генератор, с которым строится тело узла условной цепочки.
     * @param {IContext} context Текущий контекст, который содержит Mustache-выражения условных выражений.
     * @param {TMustache} test Идентификатор Mustache-выражения или функция вычисления выражения.
     * @returns {boolean} Возвращает true, если необходимо выполнить тело узла.
     */
    testIf(generator: IGenerator, context: IContext, test: TMustache): boolean;

    /**
     * Определить необходимость вычисления тела else узла.
     * @returns {boolean} Возвращает true, если необходимо выполнить тело узла.
     */
    testElse(): boolean;

    /**
     * Клонировать текущий контроллер.
     */
    clone(): IController;
}

/**
 * Класс, реализующий стандартную логику работы цепочки условных выражений.
 * В рамках данной логики вычисления test выражений выполняются до тех пор,
 * пока не будет вычеслено истинное условие. После чего выполняется тело соответствующего узла,
 * а остальные test выражения, при их наличии, не вычисляются.
 *
 * @private
 */
export class StandardController implements IController {

    /**
     * Флаг, определяющий отработал ли один из узлов цепочки или нет.
     * @private
     */
    fired: boolean;

    /**
     * Инициализировать новый инстанс контроллера.
     */
    constructor() {
        this.fired = false;
    }

    /**
     * Определить необходимость вычисления тела if, elif узлов.
     * @param {IGenerator} generator Текущий генератор, с которым строится тело узла условной цепочки.
     * @param {IContext} context Текущий контекст, который содержит Mustache-выражения условных выражений.
     * @param {TMustache} test Идентификатор Mustache-выражения или функция вычисления выражения.
     * @returns {boolean} Возвращает true, если необходимо выполнить тело узла.
     */
    testIf(generator: IGenerator, context: IContext, test: TMustache): boolean {
        if (this.fired) {
            return false;
        }

        if (generator.evalExpression(context, test)) {
            this.fired = true;
        }

        return this.fired;
    }

    /**
     * Определить необходимость вычисления тела else узла.
     * @returns {boolean} Возвращает true, если необходимо выполнить тело узла.
     */
    testElse(): boolean {
        if (this.fired) {
            return false;
        }

        this.fired = true;

        return true;
    }

    /**
     * Клонировать текущий контроллер.
     */
    clone(): IController {
        return new StandardController();
    }
}

/**
 * Класс, реализующий логику работы цепочки условных выражений для вычисления internal выражений.
 * В рамках данной логики результат test выражения проверяется на undefined. Если хотя бы одно условие
 * было вычислено как undefined, то вся остальная цепочка вычисляется вместе с test выражениями и их телами,
 * независимо от того, какой результат дадут вычисления остальных test выражений.
 *
 * Если при вычислении был получен undefined, это может означать, что выражения вычисляются не в своем контексте.
 * Тогда необходимо вычислить все имеющиеся выражения -- возможно, что-то из них изменилось, что может
 * служить причиной для перерисовки вглубь.
 *
 * @private
 */
export class InternalController implements IController {

    /**
     * Флаг, определяющий отработал ли один из узлов цепочки или нет.
     * @private
     */
    fired: boolean;

    /**
     * Флаг, определяющий, что вычисление происходит в неверном контексте,
     * потому что предыдущее условие было вычислено как undefined.
     * @private
     */
    private hasInvalidContext: boolean;

    /**
     * Инициализировать новый инстанс контроллера.
     */
    constructor() {
        this.fired = false;

        // TODO: условия в dcv не работали, только последний else мог отваливаться.
        this.hasInvalidContext = true;
    }

    /**
     * Определить необходимость вычисления тела if, elif узлов.
     * @param {IGenerator} generator Текущий генератор, с которым строится тело узла условной цепочки.
     * @param {IContext} context Текущий контекст, который содержит Mustache-выражения условных выражений.
     * @param {TMustache} test Идентификатор Mustache-выражения или функция вычисления выражения.
     * @returns {boolean} Возвращает true, если необходимо выполнить тело узла.
     */
    testIf(generator: IGenerator, context: IContext, test: TMustache): boolean {
        const condition = generator.evalExpression(context, test) as boolean;

        if (this.hasInvalidContext || !this.fired && condition) {
            this.fired = true;

            return true;
        }

        if (typeof condition === 'undefined') {
            this.hasInvalidContext = true;
            this.fired = true;

            return true;
        }

        return false;
    }

    /**
     * Определить необходимость вычисления тела else узла.
     * @returns {boolean} Возвращает true, если необходимо выполнить тело узла.
     */
    testElse(): boolean {
        if (this.hasInvalidContext || !this.fired) {
            this.fired = true;

            return true;
        }

        return false;
    }

    /**
     * Клонировать текущий контроллер.
     */
    clone(): IController {
        return new InternalController();
    }
}
