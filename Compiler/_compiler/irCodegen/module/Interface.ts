/**
 * @author Krylov M.A.
 */

/**
 * Интерфейс контроллера зависимостей.
 * Предоставляет методы для работы с зависимостями модуля.
 *
 * @private
 */
export interface IDependenciesController {

    /**
     * Добавить зависимость модуля.
     * @param {string} ref Путь к зависимости.
     * @param {string?} name Имя зависимости.
     */
    addDependency(ref: string, name?: string): void;

    /**
     * Получить списки зависимостей и имен.
     * @returns {[string[], string[]]} Возвращается кортеж: массив зависимостей, массив имен зависимостей.
     */
    getDependencies(): [string[], string[]];
}

/**
 * Интерфейрс контроллера экспортируемых данных.
 *
 * @private
 */
export interface IExportsController {

    /**
     * Установить используемый в качестве экспорта блок кода, который будет возвращен из модуля.
     * @param {string} block Блок экспортируемых данных.
     */
    setReturnableExport(block: string): void;

    /**
     * Выполнить компиляцию экспортируемых данных.
     * @returns {string} Блок экспортируемых данных.
     */
    compile(): string;
}

/**
 * Интерфейс генератора, который выполняет оформляет модуль в нужное представление.
 *
 * @private
 */
export interface IModuleGenerator {

    /**
     * Установить имя компилируемого модуля.
     * @param {string} name Имя компилируемого модуля, которое содержит имя плагина.
     */
    setModuleName(name: string): void;

    /**
     * Установить флаг строго режима для компилируемого модуля.
     * @param {boolean} value Значение флага строго режима.
     */
    setStrictMode(value: boolean): void;

    /**
     * Добавить зависимость модуля. Если не указано имя зависимости, то зависимость считается неименованной.
     * @param {string} ref Путь зависимости.
     * @param {string?} name Имя зависимости.
     */
    addDependency(ref: string, name?: string): void;

    /**
     * Добавить блок код к телу компилируемого модуля.
     * @param {string} block Блок кода, который составляет тело модуля.
     */
    addCodeBlock(block: string): void;

    /**
     * Установить блок кода, который будет возвращен из модуля как экспортируемые данные.
     * @param block {string} Блок кода как экспортируемые данные.
     */
    setReturnableExport(block: string): void;

    /**
     * Выполнить компиляцию модуля.
     * @returns {string} JavaScript код модуля.
     */
    compile(): string;
}
