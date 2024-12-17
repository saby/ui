/**
 */

/**
 * Интерфейс контроллера зависимостей.
 * Предоставляет методы для работы с зависимостями модуля.
 */
export interface IDependenciesController {
    /**
     * Добавить зависимость модуля.
     * @param ref {string} Путь к зависимости.
     * @param name {string?} Имя зависимости.
     */
    addDependency(ref: string, name?: string): void;

    /**
     * Получить списки зависимостей и имен.
     * @returns {[string[], string[]]} Возвращается кортеж: массив зависимостей, массив имен зависимостей.
     */
    getDependencies(): [string[], string[]];
}

/**
 * Класс контроллера зависимостей.
 * Предоставляет методы для работы с зависимостями модуля.
 */
class DependenciesController implements IDependenciesController {
    /**
     * Массив именованных зависимостей.
     * @private
     */
    private readonly collection: Map<string, string>;

    /**
     * Массив анонимных зависимостей.
     * @private
     */
    private readonly namelessDeps: string[];

    /**
     * Инициализировать новый инстанс контроллера зависимостей.
     */
    constructor() {
        this.collection = new Map<string, string>();
        this.namelessDeps = [];
    }

    /**
     * Добавить зависимость модуля.
     * @param ref {string} Путь к зависимости.
     * @param name {string?} Имя зависимости.
     */
    addDependency(ref: string, name?: string): void {
        if (typeof name === 'undefined') {
            return this.addNamelessDependency(ref);
        }

        if (this.collection.has(name)) {
            const cRef = this.collection.get(name);
            if (cRef === ref) {
                return;
            }

            throw new Error(
                `Ambiguous dependencies: multiple dependencies ("${cRef}", "${ref}") has one identifier name "${name}"`
            );
        }

        this.collection.set(name, ref);
    }

    /**
     * Получить списки зависимостей и имен.
     * @returns {[string[], string[]]} Возвращается кортеж: массив зависимостей, массив имен зависимостей.
     */
    getDependencies(): [string[], string[]] {
        const refs = [];
        const names = [];

        this.collection.forEach((ref: string, name: string) => {
            refs.push(ref);
            names.push(name);
        });

        return [refs.concat(this.namelessDeps), names];
    }

    /**
     * Добавить анонимную зависимость.
     * @param ref {string} Путь к зависимости.
     * @private
     */
    private addNamelessDependency(ref: string): void {
        if (this.namelessDeps.indexOf(ref) > -1) {
            return;
        }

        this.namelessDeps.push(ref);
    }
}

/**
 * Создать новый инстанс контроллера зависимостей модуля.
 * @returns {IDependenciesController} Инстанс контроллера зависимостей модуля.
 */
export function createDependenciesController(): IDependenciesController {
    return new DependenciesController();
}
