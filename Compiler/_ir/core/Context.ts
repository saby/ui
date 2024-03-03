/**
 * @author Krylov M.A.
 */

import type { IContext, IArguments, IGlobal, IDeferredCollection } from './Interface';

/**
 * Контекст выполнения шаблонных функций.
 *
 * @private
 */
export default class Context implements IContext {

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
     * Коллекция inline-шаблонов.
     */
    includedTemplates: Record<string, unknown>;

    /**
     * Инициализировать новый инстанс контекста.
     * @param {IGlobal} global Глобальный контекст шаблона.
     * @param {IArguments} args Аргументы вызова шаблонной функции.
     * @param {IContext} parent Родительский контекст.
     */
    constructor(global: IGlobal, args: IArguments, parent?: IContext) {
        this.global = global;
        this.args = args;

        this.key = parent?.key;
        this.self = parent?.self;
        this.data = parent?.data;
        this.pName = parent?.pName;
        this.templateCount = parent?.templateCount;
        this.defCollection = parent?.defCollection;
        this.viewController = parent?.viewController;
        this.forceCompatible = parent?.forceCompatible;
        this.funcContext = parent?.funcContext;
        this.includedTemplates = parent?.includedTemplates;
    }

    /**
     * (data) Объект текущих данных.
     */
    get d(): unknown {
        return this.data;
    }

    /**
     * (viewController) Инстанс текущего контроллера.
     */
    get v(): unknown {
        return this.viewController;
    }

    /**
     * Породить дочерний контекст.
     */
    spawn(): IContext {
        return new Context(this.global, this.args, this);
    }
}
