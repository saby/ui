import * as Library from 'WasabyLoader/Library';
import { getDebugModules } from 'RequireJsLoader/config';
import { logger, getStateReceiver, getStore, cookie } from 'Application/Env';
import { isDebug, getModulesDependencies } from './InitModulesDependencies';
import { DepsCollector } from './DepsCollector';
import { IModulesDeps, ICollectedFiles, ICollectedDeps, ISerializedData, IDeps } from './Interface';

/**
 * Основной класс, который собирает все зависимости и сериализованные данные текущего запроса
 * 1) зависимости модулей
 * 2) зависимости при сериализации
 * @class UICommon/_deps/PageDependenciesPrivate
 * @private
 */
export class PageDependencies {
    /**
     * Добавляет в список зависимостей текущего запроса в store новые зависимости
     */
    set pageDeps(newPageDeps: IDeps) {
        const store = getStore<Record<string, IDeps>>(this.storageKey);
        let pageDeps = store.get('pageDeps');
        if (!pageDeps || !pageDeps.length) {
            pageDeps = [];
        }
        pageDeps.push(...newPageDeps);
        store.set('pageDeps', pageDeps);
    }

    /**
     * Получить список зависимостей текущего запроса
     */
    get pageDeps(): IDeps {
        const store = getStore<Record<string, IDeps>>(this.storageKey);
        return store.get('pageDeps');
    }

    constructor(
        private depsCollector: DepsCollector,
        private storageKey: string = 'PageDependencies'
    ) {}

    /**
     * Добавить модуль в зависимости страницы.
     * Метод актуален только на СП.
     * @param modules список с названиями модулей, в обычном (Foo/bar) или библиотечном (Foo/bar:baz) синтаксисе
     * @public
     */
    addPageDeps(modules: string[]): void {
        if (typeof window !== 'undefined' || !modules || !modules.length) {
            return;
        }
        const moduleNames = [];
        modules.forEach((moduleName) => {
            const parsedInfo: { name: string } = Library.parse(moduleName);
            moduleNames.push(parsedInfo.name);
        });
        this.pageDeps = moduleNames;
    }

    /**
     * Вычисление всех зависимостей модулей текущего запроса
     * @param staticPageBundles мета информация (bundlesRoute и module-dependencies) от билдера при генерации
     *                          статичных страниц. Этот аргумент используется при генерации статичных страниц *html.tmpl
     */
    collectDependencies(staticPageBundles?: IModulesDeps): ICollectedDeps {
        const { additionalDeps, serialized } = getSerializedData();
        const deps = Object.keys(additionalDeps);
        deps.push(...this.pageDeps);
        const files = this._collectDeps(deps, staticPageBundles);
        // TODO нельзя слить ссылки и имена модулей т.к LinkResolver портит готовые ссылки
        // TODO временно прокидываю их раздельно
        return {
            js: files.js, // названия js модулей
            css: {
                simpleCss: files.css.simpleCss,
                themedCss: files.css.themedCss,
            },
            tmpl: files.tmpl,
            wml: files.wml,
            rsSerialized: serialized,
            requiredModules: deps,
        };
    }

    clear(): void {
        const store = getStore<Record<string, IDeps>>(this.storageKey);
        store.set('pageDeps', []);
    }

    /**
     * @param staticPageBundles мета информация (bundlesRoute и module-dependencies) от билдера при генерации
     *                          статичных страниц. Этот аргумент используется при генерации статичных страниц *html.tmpl
     */
    private _collectDeps(initDeps: IDeps = [], staticPageBundles?: IModulesDeps): ICollectedFiles {
        if (isDebug()) {
            return getDebugDeps();
        }
        const unpackDeps = getDebugModules(cookie.get('s3debug'));

        if (
            staticPageBundles &&
            staticPageBundles.links &&
            staticPageBundles.nodes &&
            staticPageBundles.bundles
        ) {
            const newDepsCollector = new DepsCollector(
                staticPageBundles.links,
                staticPageBundles.nodes,
                staticPageBundles.bundles,
                staticPageBundles.optionalBundles,
                staticPageBundles.features
            );
            return newDepsCollector.collectDependencies(initDeps, unpackDeps);
        }

        return this.depsCollector.collectDependencies(initDeps, unpackDeps);
    }
}

/**
 * Singleton для работы со сбором зависимостей и сериализованных данных текущего запроса
 */
const pageDependencies = initDefaultPageDependencies();
export default pageDependencies;

/**
 * Вычисление всех зависимостей модулей текущего запроса
 * @param staticPageBundles мета информация (bundlesRoute и module-dependencies) от билдера при генерации
 *                          статичных страниц. Этот аргумент используется при генерации статичных страниц *html.tmpl
 * @private
 */
export function collectDependencies(staticPageBundles?: IModulesDeps): ICollectedDeps {
    return pageDependencies.collectDependencies(staticPageBundles);
}

/**
 * Добавить модуль в зависимости страницы.
 * Метод актуален только на СП.
 * @param modules список с названиями модулей, в обычном (Foo/bar) или библиотечном (Foo/bar:baz) синтаксисе
 * @public
 * @author Мустафин Л.И.
 */
export function addPageDeps(modules: string[]): void {
    pageDependencies.addPageDeps(modules);
}

function initDefaultPageDependencies() {
    const { links, nodes, bundles, optionalBundles, features } = getModulesDependencies();
    const depsCollector = new DepsCollector(links, nodes, bundles, optionalBundles, features);
    return new PageDependencies(depsCollector);
}

function getSerializedData(): ISerializedData {
    const startSerialization = Date.now();
    const serializedData = getStateReceiver().serialize();
    logger.info(`state serialization completed in ${Date.now() - startSerialization} ms`);
    return serializedData;
}

function getDebugDeps(): ICollectedFiles {
    return {
        js: [],
        css: { themedCss: [], simpleCss: [] },
        tmpl: [],
        wml: [],
    };
}
