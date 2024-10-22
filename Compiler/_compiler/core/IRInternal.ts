/**
 * @author Krylov M.A.
 *
 * Модуль обработки Mustache-выражений на этапе аннотации.
 *
 * Решает задачи:
 * - создания псевдо синтаксических контекстов с изоляцией идентификаторов;
 * - формирования коллекции реактивных свойств (всплытие переменных);
 * - формирования контекстнозависимых наборов mustache выражений,
 *   которые используются для генерации мета-информации для вычисления internal
 *   (создание синтетических подвыражений, контроль включений / исключений).
 *
 * Каждый контейнер хранит выражения, но не занимается размещением их в таблице выражений.
 * Выделение номеров для выражений происходит на этапе генерации кода, потому что
 * только в тот момент известно -- выражение будет сгенерировано как табличная функция,
 * либо вставлено по месту использования.
 *
 * Договоренность: должна соблюдаться ссылочная целостность выражений.
 *
 * Информация для вычисления internal выражений собирается для узлов:
 * - контрол;
 * - контентная опция;
 * - ws:template;
 * - ws:partial;
 * - ws:for.
 */

import type { ProgramNode } from '../expressions/Nodes';
import * as Walkers from '../expressions/Walkers';
import { Parser } from '../expressions/Parser';

const PARSER = new Parser();

/**
 * Коллекция идентификаторов, которые не должны попадать в вычисление internal.
 */
const FORBIDDEN_INTERNAL_IDENTIFIERS = [
    '__setHTMLUnsafe',
    'rk',
    'debug'
];

/**
 * Коллекция идентификаторов, которые не являются реактивными.
 */
const FORBIDDEN_REACTIVE_IDENTIFIERS = [
    '...',
    '_options',
    '_container',
    '_children',
    '__setHTMLUnsafe',
    'rk',
    'debug'
];

/**
 * Типы создаваемых контейнеров.
 *
 * @private
 */
export enum ContainerType {

    /**
     * Глобальный контейнер.
     * Не влияет на формирование internal,
     * выступает в роли "приемника" реактивных свойств.
     */
    GLOBAL,

    /**
     * Контейнер, закрепленный за узлами типа "контрол" и "ws:partial".
     * Необходим для вычисления internal выражений.
     */
    COMPONENT,

    /**
     * Контейнер, закрепленный за узлом типа "контентная опция".
     * Необходим для вычисления internal выражений.
     */
    CONTENT_OPTION,

    /**
     * Контейнер, закрепленный за узлом типа "ws:template".
     * При статическом связывании (ws:partial -> ws:template)
     * прикрепляется к контейнеру типа COMPONENT.
     */
    TEMPLATE,

    /**
     * Контейнер, закрепленный за узлов типа "ws:for" (подтип Foreach).
     * Необходим для вычисления internal выражений.
     */
    ITERATOR
}

/**
 * Типы регистрируемых выражений.
 *
 * @private
 */
export enum ProgramType {

    /**
     * Обычное mustache-выражение, которое встречается в тексте или служебных атрибутах.
     */
    REGULAR,

    /**
     * Mustache-выражение, содержащееся в атрибуте элемента или компонента.
     */
    ATTRIBUTE,

    /**
     * Mustache-выражение, содержащееся в bind-опции компонента.
     */
    BIND,

    /**
     * Mustache-выражение, содержащееся в опции компонента.
     */
    OPTION,

    /**
     * Mustache-выражение, содержащееся в опции scope компонента.
     */
    SCOPE,

    /**
     * Mustache-выражение, содержащееся в обработчике на событие элемента или компонента.
     */
    EVENT,

    /**
     * Mustache-выражение, содержащееся в узле типа "ws:for" (подтип For).
     */
    ITERATOR
}

/**
 * Тип операции, ассоциированный с Mustache-выражением.
 *
 * @private
 */
enum OperationType {

    /**
     * Выражение необходимо игнорировать при формировании информации по internal.
     */
    IGNORE,

    /**
     * Выражение необходимо включить к вычислению.
     */
    INCLUDE,

    /**
     * Выражение необходимо исключить из вычисления.
     */
    EXCLUDE
}

/**
 * Интерфейс, описывающий зарегистрированное в контейнере Mustache-выражение.
 *
 * @private
 */
interface IProgramMeta {

    /**
     * Конкретное Mustache-выражение.
     */
    program: ProgramNode;

    /**
     * Тип выражения.
     */
    type: ProgramType;

    /**
     * Тип операции.
     */
    operation: OperationType;

    /**
     * Контейнер, в котором выражение было зарегистрировано.
     */
    origin: ProgramsContainer;
}

/**
 * Проверить, является ли идентификатор запрещенным.
 * @param {string} identifier Имя идентификатора.
 */
function isForbiddenIdentifier(identifier: string): boolean {
    return FORBIDDEN_REACTIVE_IDENTIFIERS.indexOf(identifier) > -1;
}

/**
 * Собрать все идентификаторы из Mustache выражения.
 * @param {ProgramNode} program Mustache выражение.
 */
function collectIdentifiers(program: ProgramNode): string[] {
    return Walkers
        .collectIdentifiers(program)
        .filter(identifier => FORBIDDEN_INTERNAL_IDENTIFIERS.indexOf(identifier) === -1);
}

/**
 * Класс-контейнер, реализующий псевдоконтексты для регистрации Mustache-выражений.
 * Позволяет определять наборы выражений, необходимых или запрещенных для вычисления internal наборов.
 *
 * @private
 */
export class ProgramsContainer {

//# region Class properties

    /**
     * Родительский контейнер.
     * @private
     */
    private readonly parent: ProgramsContainer;

    /**
     * Коллекция дочерних контейнеров.
     * @private
     */
    private readonly children: ProgramsContainer[];

    /**
     * Тип контейнера.
     * @private
     */
    private readonly type: ContainerType;

    /**
     * Коллекция зарегистрированных Mustache-выражений.
     */
    readonly programs: IProgramMeta[];

    /**
     * Изолированные идентификаторы, которые определяются в текущем контейнере.
     * Не позволяют всплывать выражениям, которые содержат эти идентификаторы.
     */
    readonly isolatedIdentifiers: string[];

    /**
     * Коллекция идентификаторов, претендующих на роль реактивных.
     */
    readonly reactiveIdentifiers: string[];

//# endregion

    /**
     * Инициализировать новый инстанс контейнера.
     * @param {ContainerType} type Тип контейнера.
     * @param {ProgramsContainer} parent Инстанс родительского контейнера.
     */
    constructor(type: ContainerType, parent: ProgramsContainer = null) {
        this.parent = parent;
        this.children = [];
        this.type = type;

        this.programs = [];
        this.isolatedIdentifiers = [];
        this.reactiveIdentifiers = [];
    }

    /**
     * Породить новый контейнер для выражений.
     * @param {ContainerType} type Тип контейнера, соответствующий узлу, на котором он создается.
     */
    spawn(type: ContainerType): ProgramsContainer {
        const child = new ProgramsContainer(type, this);

        this.children.push(child);

        return child;
    }

    /**
     * Зарегистрировать идентификатор.
     * Все выражения, содержащий данный идентификатор, будут исключаться при всплытии и дробиться на подвыражения.
     * Идентификаторы должны регистрироваться перед регистрацией Mustache-выражений!
     * @param {string} identifier Имя идентификатора.
     */
    registerIdentifier(identifier: string): void {
        if (this.isolatedIdentifiers.indexOf(identifier) === -1) {
            this.isolatedIdentifiers.push(identifier);
        }
    }

    /**
     * Зарегистрировать Mustache выражение, которое вычисляется в рамках данного контейнера.
     * @param {ProgramNode} program Mustache выражение.
     * @param {ProgramType} type Тип выражения, соответствующий месту, где выражение было вставлено.
     */
    registerProgram(program: ProgramNode, type: ProgramType): void {
        switch (type) {
            case ProgramType.REGULAR:
            case ProgramType.ATTRIBUTE:
            case ProgramType.OPTION:
                return this.processProgram(program, type, OperationType.IGNORE);

            case ProgramType.SCOPE:
                return this.processProgram(program, type, OperationType.INCLUDE);

            case ProgramType.BIND:
                return this.processBindProgram(program);

            case ProgramType.EVENT:
                return this.processEventProgram(program);

            case ProgramType.ITERATOR:
                return this.processIteratorProgram(program);

            default:
                throw new Error('получен неизвестный тип Mustache-выражения');
        }
    }

    /**
     * Получить набор имен реактивных свойств.
     * Для получения полного набора переменных метод должен вызываться над глобальным контейнером.
     */
    getReactiveIdentifiers(): string[] {
        return this.reactiveIdentifiers;
    }

    /**
     * Присоединить существующий контейнер типа TEMPLATE к контейнеру типа COMPONENT.
     * @param {ProgramsContainer} container Контейнер узла ws:template, содержащий выражения,
     * которые не были подняты выше для обработки.
     * @param {string[]} identifiers Список идентификаторов. Это опции компонента, которые не содержат
     * прямой проброс опций (здесь не ожидаются опции вида name="{{ name }}").
     */
    attach(container: ProgramsContainer, identifiers: string[]): void {
        if (this.type !== ContainerType.COMPONENT) {
            throw new Error(`внутреняя ошибка: присоединение возможно только к контейнеру типа COMPONENT, получен контейнер типа ${ContainerType[this.type]}`);
        }

        if (container.type !== ContainerType.TEMPLATE) {
            throw new Error(`внутреняя ошибка: присоединение возможно только контейнера типа TEMPLATE, получен контейнер типа ${ContainerType[container.type]}`);
        }

        container.isolatedIdentifiers.forEach((identifier) => {
            this.commitIsolatedIdentifier(identifier);
        });

        container.reactiveIdentifiers.forEach((identifier) => {
            this.hoistReactiveIdentifier(identifier);
        });

        identifiers.forEach((identifier) => {
            this.commitIsolatedIdentifier(identifier);
        });

        container.programs.forEach((meta) => {
            this.hoistProgram(meta.program, meta.type, meta.operation, meta.origin);
        });
    }

    /**
     * Получить набор include / exclude Mustache выражений, необходимый для вычисления internal коллекции.
     */
    getInternalsMeta(): ProgramNode[] {
        if (this.type === ContainerType.COMPONENT) {
            // Коллекция internal, содержащаяся на компоненте, должна содержать только bind и scope выражения,
            // относящиеся только к самому компоненту.
            return this.programs
                .filter((meta) => (
                    meta.origin === this && (
                        meta.type === ProgramType.BIND ||
                        meta.type === ProgramType.SCOPE
                    )
                ))
                .map(meta => meta.program)
                .sort((a, b) => (a.referenceId ?? 0) - (b.referenceId ?? 0));
        }

        return this.programs
            .filter((meta) => (
                meta.operation !== OperationType.EXCLUDE
            ))
            .map(meta => meta.program)
            .sort((a, b) => (a.referenceId ?? 0) - (b.referenceId ?? 0));
    }

    /**
     * Обработать обычное Mustache выражение, согласно его типу.
     * @param {ProgramNode} program Mustache выражение.
     * @param {ProgramType} type Тип выражения, соответствующий месту, где выражение было вставлено.
     * @param {OperationType} operation Тип операции, рекомендованный для выражения.
     * @param {ProgramsContainer?} origin Контейнер, на котором произошла регистрация выражения.
     * @private
     */
    private processProgram(
        program: ProgramNode,
        type: ProgramType,
        operation: OperationType,
        origin?: ProgramsContainer
    ): void {
        if (Walkers.hasDecorators(program)) {
            // FIXME: вообще декораторы содержат идентификаторы, которые могут быть реактивными,
            //  и вычисляемое выражение. Пока придерживаюсь прежнего поведения.
            return;
        }

        if (!this.processIdentifiers(program)) {
            return;
        }

        this.hoistProgram(program, type, operation, origin ?? this);
    }

    /**
     * Обработать Mustache выражение, содержащееся в конструкции bind.
     * @param {ProgramNode} program Mustache выражение.
     * @private
     */
    private processBindProgram(program: ProgramNode): void {
        const programs = Walkers.dropBindProgram(program);

        if (programs.length === 2) {
            // Сохраним контекст -- синтетическое выражение
            this.processProgram(programs[0], ProgramType.BIND, OperationType.INCLUDE, this);
        }

        // Сохраним оригинальное выражение -- оно тоже нужно для internal
        this.processProgram(program, ProgramType.BIND, OperationType.INCLUDE, this);
    }

    /**
     * Обработать Mustache выражение, содержащееся в обработчике события.
     * @param {ProgramNode} program Mustache выражение.
     * @private
     */
    private processEventProgram(program: ProgramNode): void {
        this.processIdentifiers(program);
    }

    /**
     * Обработать Mustache выражение, содержащееся в конструкции for.
     * @param {ProgramNode} program Mustache выражение.
     * @private
     */
    private processIteratorProgram(program: ProgramNode): void {
        const identifiers = collectIdentifiers(program);

        this.commitSyntheticPrograms(identifiers, ProgramType.ITERATOR, this);

        for (let index = 0; index < identifiers.length; ++index) {
            const identifier = identifiers[index];

            this.hoistReactiveIdentifier(identifier);

            // FIXME: не каждый идентификатор нужно класть в isolated, а только самостоятельные Identifier,
            //  либо корневые идентификаторы MemberExpression.
            this.commitIsolatedIdentifier(identifier);
        }

        this.commitProgram(program, ProgramType.ITERATOR, OperationType.EXCLUDE, this);
    }

    /**
     * Собрать все идентификаторы из Mustache выражения.
     * @param {ProgramNode} program Mustache выражение.
     * @returns {boolean} Возвращает true, если Mustache выражение содержит идентификаторы.
     * В таком случае выражение должно быть полностью обработано.
     * @private
     */
    private processIdentifiers(program: ProgramNode): boolean {
        const identifiers = collectIdentifiers(program);

        if (identifiers.length === 0) {
            return false;
        }

        for (let index = 0; index < identifiers.length; ++index) {
            const identifier = identifiers[index];

            this.hoistReactiveIdentifier(identifier);
        }

        return true;
    }

    /**
     * Проверить Mustache выражение на наличие изолированных переменных.
     * Если таковые имеются, необходимо создать подвыражения по уникальным идентификаторам.
     * @param {ProgramNode} program Mustache выражение.
     * @param {ProgramType} type Тип выражения, соответствующий месту, где выражение было вставлено.
     * @param {ProgramsContainer} origin Контейнер, на котором произошла регистрация выражения.
     * @private
     */
    private processIntersections(program: ProgramNode, type: ProgramType, origin: ProgramsContainer): boolean {
        if (!Walkers.containsIdentifiers(program, this.isolatedIdentifiers)) {
            return false;
        }

        const identifiers = collectIdentifiers(program);

        this.commitSyntheticPrograms(identifiers, type, origin);

        return true;
    }

    /**
     * Проверить, возможно ли вслытие из текущего контейнера.
     * @private
     */
    private isHoistingAllowed(): boolean {
        return this.parent !== null && this.type !== ContainerType.TEMPLATE;
    }

    /**
     * Поднять Mustache выражение.
     * @param {ProgramNode} program Mustache выражение.
     * @param {ProgramType} type Тип выражения, соответствующий месту, где выражение было вставлено.
     * @param {OperationType} operation Тип операции, рекомендованный для выражения.
     * @param {ProgramsContainer} origin Контейнер, на котором произошла регистрация выражения.
     * @private
     */
    private hoistProgram(
        program: ProgramNode,
        type: ProgramType,
        operation: OperationType,
        origin: ProgramsContainer
    ): void {
        this.commitProgram(program, type, operation, origin);

        // Необходимо на каждом контейнере проверять наличие пересечений по идентификаторам
        if (this.processIntersections(program, type, origin)) {
            return;
        }

        if (this.isHoistingAllowed()) {
            this.parent.hoistProgram(program, type, operation, origin);
        }
    }

    /**
     * Поднять идентификатор, претендующего на роль реактивного.
     * @param {string} identifier Имя идентификатора.
     * @private
     */
    private hoistReactiveIdentifier(identifier: string): void {
        if (this.isolatedIdentifiers.indexOf(identifier) > -1) {
            return;
        }

        if (this.parent !== null) {
            this.parent.hoistReactiveIdentifier(identifier);

            return;
        }

        this.commitReactiveIdentifier(identifier);
    }

    /**
     * Зафиксировать синтетические выражения по идентификаторам.
     * @param {string[]} identifiers Коллекция идентификаторов, из которых создаются Mustache выражения.
     * @param {ProgramType} type Базовый тип Mustache выражения на основе родительского Mustache выражения.
     * @param {ProgramsContainer} origin Контейнер, на котором произошла регистрация выражения.
     * @private
     */
    private commitSyntheticPrograms(identifiers: string[], type: ProgramType, origin: ProgramsContainer): void {
        // Из простых идентификаторов сделать выражения и зарегистрировать их

        for (let index = 0; index < identifiers.length; ++index) {
            const identifier = identifiers[index];

            if (this.isolatedIdentifiers.indexOf(identifier) > -1) {
                continue;
            }

            const program = PARSER.parse(identifier);

            this.processProgram(program, type, OperationType.INCLUDE, origin);
        }
    }

    /**
     * Зафиксировать изолированный идентификатор.
     * @param {string} identifier Имя идентификатора.
     * @private
     */
    private commitIsolatedIdentifier(identifier: string): void {
        if (this.isolatedIdentifiers.indexOf(identifier) > -1) {
            return;
        }

        this.isolatedIdentifiers.push(identifier);
    }

    /**
     * Зафиксировать реактивный идентификатор.
     * @param {string} identifier Имя идентификатора.
     * @private
     */
    private commitReactiveIdentifier(identifier: string): void {
        if (this.reactiveIdentifiers.indexOf(identifier) > -1) {
            return;
        }

        if (isForbiddenIdentifier(identifier)) {
            return;
        }

        this.reactiveIdentifiers.push(identifier);
    }

    /**
     * Зафиксировать Mustache выражение.
     * @param {ProgramNode} program Mustache выражение.
     * @param {ProgramType} type Тип выражения, соответствующий месту, где выражение было вставлено.
     * @param {OperationType} operation Тип операции, рекомендованный для выражения.
     * @param {ProgramsContainer} origin Контейнер, на котором произошла регистрация выражения.
     * @private
     */
    private commitProgram(
        program: ProgramNode,
        type: ProgramType,
        operation: OperationType,
        origin: ProgramsContainer
    ): void {
        this.programs.push({
            program,
            type,
            operation,
            origin
        });
    }
}
