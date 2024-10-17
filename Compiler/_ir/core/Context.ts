/**
 * @author Krylov M.A.
 */

import type { IContext, IArguments, IGlobal } from './Interface';

/**
 * Контекст выполнения шаблонных функций.
 *
 * @private
 */
export default class Context implements IContext {

    /**
     * Глобальный контекст шаблона.
     */
    global: IContext['global'];

    /**
     * Именованные аргументы вызова шаблонной функции.
     */
    args: IContext['args'];

    /**
     * Ключ родительского узла.
     */
    key: IContext['key'];

    /**
     * Контекст вызова шаблона.
     */
    self: IContext['self'];

    /**
     * Объект текущих данных.
     */
    data: IContext['data'];

    /**
     * Имя текущего шаблона или контентной опции.
     */
    pName: IContext['pName'];

    /**
     * Счетчик построенных шаблонов, используемый при формировании ключей.
     */
    templateCount: IContext['templateCount'];

    /**
     * Коллекция deferred инстансов.
     */
    defCollection: IContext['defCollection'];

    /**
     * Инстанс текущего контроллера.
     */
    viewController: IContext['viewController'];

    /**
     * Опция включения совместимости markup-генератора.
     */
    forceCompatible: IContext['forceCompatible'];

    /**
     * Контекст для выполнения функций.
     */
    funcContext: IContext['funcContext'];

    /**
     * Коллекция inline-шаблонов.
     */
    includedTemplates: IContext['includedTemplates'];

    /**
     * Инициализировать новый инстанс контекста.
     * @param {IGlobal} global Глобальный контекст шаблона.
     * @param {IArguments} args Аргументы вызова шаблонной функции.
     * @param {IContext} parent Родительский контекст.
     */
    constructor(global: IGlobal, args: IArguments, parent?: IContext) {
        this.global = global;
        this.args = args;

        if (parent) {
            this.key = parent.key;
            this.self = parent.self;
            this.data = parent.data;
            this.pName = parent.pName;
            this.templateCount = parent.templateCount;
            this.defCollection = parent.defCollection;
            this.viewController = parent.viewController;
            this.forceCompatible = parent.forceCompatible;
            this.funcContext = parent.funcContext;
            this.includedTemplates = parent.includedTemplates;
        }
    }

    /**
     * (data) Объект текущих данных.
     */
    get d() {
        return this.data;
    }

    /**
     * (viewController) Инстанс текущего контроллера.
     */
    get v() {
        return this.viewController;
    }

    /**
     * Породить дочерний контекст.
     */
    spawn(): IContext {
        return new Context(this.global, this.args, this);
    }
}
