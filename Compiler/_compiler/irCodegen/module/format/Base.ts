/**
 * @author Krylov M.A.
 */

import type { IModuleGenerator, IDependenciesController, IExportsController } from '../Interface';

/**
 * Абстрактный базовый класс процессора модулей.
 * Предоставляет общие данные и методы для выполнения компиляции.
 *
 * @private
 */
export default abstract class Base implements IModuleGenerator {

    /**
     * Имя компилируемого модуля.
     * @protected
     */
    protected name: string;

    /**
     * Флаг включения строго режима для компилируемого модуля.
     * @protected
     */
    protected useStrict: boolean;

    /**
     * Содержимое модуля.
     * @protected
     */
    protected contents: string[];

    /**
     * Инстанс контроллера зависимостей, необходимый для работы с именованными и
     * безымянными (анонимными) зависимостями модуля.
     * @protected
     */
    protected dependenciesController: IDependenciesController;

    /**
     * Инстанс контроллера экспортируемых данных.
     * @protected
     */
    protected exportsController: IExportsController;

    /**
     * Инициализировать инстанс базового класса.
     * @protected
     * @param {IDependenciesController} dependencies Контроллер зависимостей.
     * @param {IExportsController} exports Контроллер экспортируемых данных.
     * @protected
     */
    constructor(dependencies: IDependenciesController, exports: IExportsController) {
        this.name = '';
        this.useStrict = false;
        this.contents = [];

        this.dependenciesController = dependencies;
        this.exportsController = exports;
    }

    /**
     * Установить имя компилируемого модуля.
     * @param {string} name Имя компилируемого модуля, которое содержит имя плагина.
     */
    setModuleName(name: string): void {
        this.name = name;
    }

    /**
     * Установить флаг строго режима для компилируемого модуля.
     * @param {boolean} value Значение флага строго режима.
     */
    setStrictMode(value: boolean): void {
        this.useStrict = value;
    }

    /**
     * Добавить зависимость модуля. Если не указано имя зависимости, то зависимость считается неименованной.
     * @param {string} ref Путь зависимости.
     * @param {string?} name Имя зависимости.
     */
    addDependency(ref: string, name?: string): void {
        this.dependenciesController.addDependency(ref, name);
    }

    /**
     * Добавить блок код к телу компилируемого модуля.
     * @param {string} block Блок кода, который составляет тело модуля.
     */
    addCodeBlock(block: string): void {
        this.contents.push(block);
    }

    /**
     * Установить блок кода, который будет возвращен из модуля как экспортируемые данные.
     * @param {string} block Блок кода как экспортируемые данные.
     */
    setReturnableExport(block: string): void {
        this.exportsController.setReturnableExport(block);
    }

    /**
     * Выполнить компиляцию модуля.
     * @abstract
     * @returns {string} JavaScript код модуля.
     */
    abstract compile(): string;
}
