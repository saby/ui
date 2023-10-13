import { getConfig } from 'Application/Env';
import { constants, cookie } from 'Env/Env';
import { IContents, IModules, IModulesDeps, IBundlesRoute, IDeps } from './Interface';
import { IModuleDependenciesRaw } from './Interface';

/**
 * constants.resourceRoot указан путь до корневой директории сервиса,
 * а нужен путь до продукта, который 'resources'
 * но в инт.тестах корень не 'resources', а именно constants.resourceRoot
 */
let root = 'resources';
let contents: Partial<IContents> = {};
try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contents = require(`json!${root}/contents`) || {}; // eslint-disable-line @typescript-eslint/no-var-requires
} catch {
    try {
        root = constants.resourceRoot;
        // в демо стендах resourceRoot равен "/"
        // из-за этого в релиз режиме путь к мета файлам формируется с двойным слешем и require не грузит такие файлы
        root = root === '/' ? '' : root;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        contents = require(`json!${root}contents`) || {}; // eslint-disable-line @typescript-eslint/no-var-requires
    } catch {
        contents = {};
    }
}

const noDescription: IModulesDeps = {
    nodes: {},
    links: {},
    bundles: {},
    optionalBundles: {},
    optionalBundlesModuleNames: [],
};

/**
 * Класс-синглтон, который призван собрать мета информацию о модулях текущего сервиса в момент запуска
 * @private
 */
export class ModulesDependencies {
    modulesMeta: IModulesDeps;

    get nodes() {
        return this.modulesMeta.nodes;
    }

    get optionalBundlesModuleNames() {
        return this.modulesMeta.optionalBundlesModuleNames;
    }

    constructor(private rootPath: string, private modules: IModules = {}) {
        this.modulesMeta = this.getModulesDeps();
    }

    /**
     * Импорт module-dependencies.json текущего сервиса и всех внешних
     * для коллекции зависимостей на СП
     * @param modules - словарь используемых модулей, для которых собираются зависимости
     */
    getModulesDeps(): IModulesDeps {
        if (typeof window !== 'undefined') {
            return noDescription;
        }

        /** Список модулей сторонних сервисов
         * файлы module-dependencies и bundlesRoute для модулей сторонних сервисов необходимо брать из этих модулей,
         * т.к. require'ом не получится достучаться до корня стороннего сервиса
         */
        const externalModuleNames = [];
        // список модулей, в которых есть опциональные бандлы
        const optBundlesModuleNames = [];
        // список модулей-фич, которые нужно добавлять в список зависимостей
        const features = {};
        for (const name of Object.keys(this.modules)) {
            if (this.modules[name].path) {
                externalModuleNames.push(name);
            }
            if (this.modules[name].hasOptionalBundles) {
                optBundlesModuleNames.push(name);
            }
            if (this.modules[name].features) {
                const mFeatures = this.modules[name].features;
                for (const mName in mFeatures) {
                    if (!mFeatures.hasOwnProperty(mName)) {
                        continue;
                    }
                    features[mName] = `${mFeatures[mName]}/${mName.split('/')[1]}`;
                }
            }
        }

        // формирование объектов links, nodes, bundles
        const moduleDeps: Partial<IModulesDeps> = [this.rootPath, ...externalModuleNames]
            .map(this.requireModuleDeps.bind(this))
            .reduce((res: IModulesDeps, currItem: IModulesDeps) => {
                for (const linkItem of Object.keys(currItem.links)) {
                    res.links[linkItem] = currItem.links[linkItem];
                }
                for (const nodeItem of Object.keys(currItem.nodes)) {
                    res.nodes[nodeItem] = currItem.nodes[nodeItem];
                }
                for (const bundleItem of Object.keys(currItem.bundles)) {
                    res.bundles[bundleItem] = currItem.bundles[bundleItem];
                }
                return res;
            });

        let optBundles: Partial<IModulesDeps> = { optionalBundles: {} };
        if (optBundlesModuleNames.length) {
            // формирование объекта optionalBundles
            optBundles = optBundlesModuleNames
                .map(this.requireModuleOptionalBundles.bind(this))
                // т.к. сейчас здесь данные как [{ optionalBundles: { 'bundlename': [ 'module1', 'module2' ] } } ]
                // то необходимо развернуть их в вид
                // [{ optionalBundles: { 'module1': 'bundlename', 'module2': 'bundlename' } } ]
                .map(({ bundles }) => {
                    const newOptBundle = {};
                    for (const bundleName in bundles) {
                        if (!bundles.hasOwnProperty(bundleName)) {
                            continue;
                        }
                        for (const name of bundles[bundleName]) {
                            newOptBundle[name] = bundleName.endsWith('.js')
                                ? bundleName
                                : `${bundleName}.js`;
                        }
                    }
                    return { optionalBundles: newOptBundle };
                })
                .reduce((res: Partial<IModulesDeps>, curr: Partial<IModulesDeps>) => {
                    return {
                        optionalBundles: {
                            ...res.optionalBundles,
                            ...curr.optionalBundles,
                        },
                    };
                });
        }

        return {
            ...moduleDeps,
            ...optBundles,
            optionalBundlesModuleNames: optBundlesModuleNames,
            features,
        } as IModulesDeps;
    }

    /**
     * Получение мета данных links, nodes, bundles
     */
    requireModuleDeps(moduleName: string): Partial<IModulesDeps> {
        let deps: IModuleDependenciesRaw<string[] | number[]>;
        try {
            deps = this.require(`json!${moduleName}/module-dependencies`);
        } catch {
            return noDescription;
        }

        let bundles: IBundlesRoute = {};
        try {
            bundles = this.require(`json!${moduleName}/bundlesRoute`);
        } catch {
            // Нет мета-информации по модулю, о том, включены ли его файлы в superbundles
        }

        if (!deps.nodesList) {
            return {
                links: (deps as IModuleDependenciesRaw<string[]>).links,
                nodes: deps.nodes,
                bundles,
            };
        }

        const newDeps = this.convertLinks(deps as IModuleDependenciesRaw<number[]>);

        return { links: newDeps.links, nodes: newDeps.nodes, bundles };
    }

    /**
     * Получение мета данных из файлов optionalBundles.json.
     * Это экспериментальная паковка модулей в спец. бандл
     */
    requireModuleOptionalBundles(moduleName: string): {
        bundles?: Record<string, IDeps>;
    } {
        let bundles: Record<string, IDeps> = {};
        try {
            bundles = this.require(`json!${moduleName}/optionalBundles`);
        } catch {
            // Нет мета-информации по модулю, о том, включены ли его файлы в superbundles
        }
        return { bundles };
    }

    /**
     * Объект links вида {'Module': [0, 1]} превращает в вид {'Module': ['Module1', 'Module2']}
     */
    convertLinks(deps: IModuleDependenciesRaw<number[]>): IModuleDependenciesRaw<string[]> {
        const links: Record<string, string[]> = {};

        for (const moduleName in deps.links) {
            if (!deps.links.hasOwnProperty(moduleName)) {
                continue;
            }
            links[moduleName] = deps.links[moduleName].map((index) => deps.nodesList[index]);
        }

        return { nodes: deps.nodes, links };
    }

    /**
     * Обертка над вызовом require, чтобы можно было тестировать класс
     */
    require(path: string) {
        return require(path);
    }
}

const modulesDependencies = new ModulesDependencies(root, contents.modules);

/**
 * Проверяет по файлу module-dependencies наличие указанного модуля в текущем сервисе
 * @param moduleName Название модуля, которое хотим проверить на наличие
 */
export function isModuleExists(moduleName: string): boolean {
    // Если сервис собран в debug-режиме, то файл module-dependencies не будет сгенерирован.
    // Тогда по умолчанию считаем что модуль существует.
    if (contents.buildMode === 'debug') {
        return true;
    }
    return !!modulesDependencies.nodes[moduleName];
}

export function isDebug(): boolean {
    return cookie.get('s3debug') === 'true' || contents.buildMode === 'debug';
}

export function getModulesDependencies(): IModulesDeps {
    return modulesDependencies.modulesMeta;
}

/**
 * Получение списка кастомных бандлов (optionalBundles) для вставки их в верстку.
 * Только если по куке optionalBundles включили обработку этих кастомных бандлов.
 *
 * Вставить нужно строго после основного bundles.js, но до require.js.
 * Поэтому этот метод зовется в роутере при вставке базового bundle.js.
 * @private
 */
export function getOptionalBundles(): Record<string, string> {
    if (
        !modulesDependencies.optionalBundlesModuleNames ||
        !(cookie.get('optionalBundles') === 'true' || getConfig('optionalBundles') === 'true')
    ) {
        return {};
    }
    const result = {};
    modulesDependencies.optionalBundlesModuleNames.forEach((moduleName) => {
        result[moduleName] = `${moduleName}/optionalBundles`;
    });
    return result;
}
