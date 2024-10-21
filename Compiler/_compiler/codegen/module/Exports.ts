/**
 */

/**
 * Интерфейрс контроллера экспортируемых данных.
 */
export interface IExportsController {
    /**
     * Установить используемый в качестве экспорта блок кода, который будет возвращен из модуля.
     * @param block {string} Блок экспортируемых данных.
     */
    setReturnableExport(block: string): void;

    /**
     * Выполнить компиляцию экспортируемых данных.
     * @returns {string} Блок экспортируемых данных.
     */
    compile(): string;
}

/**
 * Класс контроллера экспортируемых данных.
 * Позволяет устананавливать экспортируемые данные и выполнять их компиляцию для вставки в тело модуля.
 */
class ExportsController implements IExportsController {
    /**
     * Блок кода с экспортируемыми данными, который будет возвращен из модуля.
     * @private
     */
    private returnableExport: string;

    /**
     * Инициализировать новый инстанс контроллера экспортируемых данных.
     */
    constructor() {
        this.returnableExport = '';
    }

    /**
     * Установить используемый в качестве экспорта блок кода, который будет возвращен из модуля.
     * @param block {string} Блок экспортируемых данных.
     */
    setReturnableExport(block: string): void {
        if (this.returnableExport) {
            throw new Error('Tried to overwrite returnable export block');
        }

        this.returnableExport = block;
    }

    /**
     * Выполнить компиляцию экспортируемых данных.
     * @returns {string} Блок экспортируемых данных.
     */
    compile(): string {
        if (this.returnableExport) {
            return `return ${this.returnableExport};`;
        }
        return '';
    }
}

/**
 * Создать новый инстанс контроллера экспортируемых данных.
 * @returns {IExportsController} Инстанс контроллера экспортируемых данных.
 */
export function createExportsController(): IExportsController {
    return new ExportsController();
}
