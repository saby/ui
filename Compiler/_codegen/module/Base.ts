/**
 */

import {
    IDependenciesController,
    createDependenciesController,
} from './Dependencies';
import { IExportsController, createExportsController } from './Exports';

/**
 * Интерфейс процессора, который выполняет компиляцию модуля в различный формат.
 */
export interface IModuleProcessor {
    /**
     * Установить имя компилируемого модуля.
     * @param name {string} Имя компилируемого модуля, которое содержит имя плагина.
     */
    setModuleName(name: string): void;

    /**
     * Установить флаг строго режима для компилируемого модуля.
     * @param value {boolean} Значение флага строго режима.
     */
    setStrictMode(value: boolean): void;

    /**
     * Добавить зависимость модуля. Если не указано имя зависимости, то зависимость считается неименованной.
     * @param ref {string} Путь зависимости.
     * @param name {string?} Имя зависимости.
     */
    addDependency(ref: string, name?: string): void;

    /**
     * Добавить блок код к телу компилируемого модуля.
     * @param block {string} Блок кода, который составляет тело модуля.
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

/**
 * Абстрактный базовый класс процессора модулей.
 * Предоставляет общие данные и методы для выполнения компиляции.
 */
export abstract class Base implements IModuleProcessor {
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
     * Массив кода, который составляет тело будущего модуля.
     * @protected
     */
    protected code: string[];

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
     */
    protected constructor() {
        this.name = '';
        this.useStrict = false;
        this.code = [];
        this.dependenciesController = createDependenciesController();
        this.exportsController = createExportsController();
    }

    /**
     * Установить имя компилируемого модуля.
     * @param name {string} Имя компилируемого модуля, которое содержит имя плагина.
     */
    setModuleName(name: string): void {
        this.name = name;
    }

    /**
     * Установить флаг строго режима для компилируемого модуля.
     * @param value {boolean} Значение флага строго режима.
     */
    setStrictMode(value: boolean): void {
        this.useStrict = value;
    }

    /**
     * Добавить зависимость модуля. Если не указано имя зависимости, то зависимость считается неименованной.
     * @param ref {string} Путь зависимости.
     * @param name {string?} Имя зависимости.
     */
    addDependency(ref: string, name?: string): void {
        this.dependenciesController.addDependency(ref, name);
    }

    /**
     * Добавить блок код к телу компилируемого модуля.
     * @param block {string} Блок кода, который составляет тело модуля.
     */
    addCodeBlock(block: string): void {
        this.code.push(block);
    }

    /**
     * Установить блок кода, который будет возвращен из модуля как экспортируемые данные.
     * @param block {string} Блок кода как экспортируемые данные.
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
