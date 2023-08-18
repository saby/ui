/**
 * @author Krylov M.A.
 */

import type { IGenerator } from '../generator/Interface';
import type { IMethods } from '../methods/Interface';
import type { IRTemplateBody } from './IRTemplateBody';

/**
 * Режим выполнения шаблонной функции.
 */
export declare type TMode = 'markup' | 'internal';

/**
 * Тип mustache-выражения, с которым работают методы вычисления.
 */
export declare type TMustache = number;

/**
 * Коллекция индексов Mustache выражений для вычисления internal выражений.
 * В первом наборе перечисляются индексы выражений, необходимых к вычислению.
 * Во втором наборе перечисляются индексы выражений, запрещенных к вычислению.
 */
export declare type TInternalMeta = [number[], number[]];

/**
 * Коллекция мета-описаний для вычисления internal выражений.
 */
export declare type TInternalsCollection = TInternalMeta[];

/**
 * Глобальный контекст шаблона.
 *
 * @private
 */
export interface IGlobal {

    /**
     * Версия шаблона.
     */
    version: number;

    /**
     * Имя модуля шаблона.
     */
    moduleName: string;

    /**
     * Набор именованных зависимостей шаблона, включая именованные шаблоны.
     */
    depsLocal: Record<string, unknown>;

    /**
     * @todo Выяснить, что за зверь и как он формируется.
     */
    includedTemplates: unknown;

    /**
     * Коллекция исходных приватных шаблонных функций.
     */
    bodies: IRTemplateBody[];

    /**
     * Коллекция публичных шаблонных функций.
     */
    templates: TemplateFunction[];

    /**
     * Набор Mustache-выражений.
     */
    expressions: MustacheExpression[];

    /**
     * Коллекция мета описаний для вычисления internal выражений.
     */
    internalsMeta: TInternalsCollection;

    /**
     * Флаг, определяющий тип замыканий, используемый при генерации шаблонных функций.
     */
    isWasabyTemplate: boolean;
}

/**
 * Именованные аргументы вызова шаблонной функции.
 *
 * @private
 */
export interface IArguments {

    /**
     * Контекст вызова шаблонной функции.
     */
    self: Record<string, unknown>;

    /**
     * 1й аргумент вызова шаблонной функции.
     */
    data: Record<string, unknown>;

    /**
     * 2й аргумент вызова шаблонной функции.
     */
    attr: Record<string, unknown>;

    /**
     * 3й аргумент вызова шаблонной функции.
     */
    context: unknown;

    /**
     * 4й аргумент вызова шаблонной функции.
     */
    isVdom: boolean;

    /**
     * 5й аргумент вызова шаблонной функции.
     */
    sets: unknown;

    /**
     * 6й аргумент вызова шаблонной функции.
     */
    forceCompatible: boolean;

    /**
     * 7й аргумент вызова шаблонной функции.
     */
    generatorConfig: unknown;
}

/**
 * Интерфейс коллекции deferred инстансов.
 * @private
 */
export interface IDeferredCollection {
    id: string[];
    def: Promise<unknown>[] | undefined[];
}

/**
 * Приватный интерфейс контекста, используемого в генераторе.
 *
 * @public
 */
export interface IContext {

    /**
     * (data) Объект текущих данных.
     */
    readonly d: unknown;

    /**
     * (viewController) Инстанс текущего контроллера.
     */
    readonly v: unknown;

    /**
     * Глобальный контекст шаблона.
     */
    readonly global: IGlobal;

    /**
     * Именованные аргументы вызова шаблонной функции.
     */
    readonly args: IArguments;

    /**
     * Ключ родительского узла.
     */
    key: number | string;

    /**
     * Контекст вызова шаблона.
     */
    self: Record<string, unknown>;

    /**
     * Объект текущих данных.
     */
    data: Record<string, unknown>;

    /**
     * Имя текущего шаблона или контентной опции.
     */
    pName: string;

    /**
     * Счетчик построенных шаблонов, используемый при формировании ключей.
     */
    templateCount: number;

    /**
     * Коллекция deferred инстансов.
     */
    defCollection: IDeferredCollection;

    /**
     * Инстанс текущего контроллера.
     */
    viewController: unknown;

    /**
     * Опция включения совместимости markup-генератора.
     */
    forceCompatible: boolean;

    /**
     * Контекст для выполнения функций.
     */
    funcContext: unknown;

    /**
     * TODO: определить
     */
    includedTemplates: Record<string, unknown>;

    /**
     * Породить дочерний контекст.
     */
    spawn(): IContext;
}

/**
 * Тип шаблонной функции, выполняющей построение определенного фрагмента шаблона.
 */
export declare type TemplateBody = (
    generator: IGenerator,
    context: IContext
) => unknown;

/**
 * Тип функции, выполняющей вычисление Mustache выражения.
 */
export declare type MustacheExpression = (
    methods: IMethods,
    data: object,
    context?: object,
    children?: object
) => unknown;

/**
 * Тип шаблонной функции, сигнатура которого поддерживается клиентами.
 *
 * @public
 */
export interface TemplateFunction extends Function {

    /**
     * Функция сериализации шаблонной функции.
     */
    toJSON?: Function;
}
