import { controller } from 'I18n/i18n';
import { cookie, getConfig } from 'Application/Env';
import {
    ICollectedDepsRaw,
    IDeps,
    ICollectedFiles,
    ILocalizationResources,
} from './Interface';
import { collectDependencies, getAllPackagesNames } from './RecursiveWalker';

/**
 * Модуль для коллекции зависимостей на СП
 * @private
 */
export class DepsCollector {
    /**
     * @param modDeps - object, contains all nodes of dependency tree
     * @param modInfo - contains info about path to module files
     * @param bundlesRoute - contains info about custom packets with modules
     * @param optionalBundles - содержит информацию о том, в каком бандле лежит конкретный модуль
     */
    constructor(
        private modDeps: Record<string, IDeps>,
        private modInfo: object,
        private bundlesRoute: Record<string, string>,
        private optionalBundles: Record<string, string>
    ) {}

    collectDependencies(
        depends: IDeps = [],
        unpack: IDeps = []
    ): ICollectedFiles {
        const deps: string[] = [];
        depends
            /** Убираем пустые зависимости и зависимости, которые нужно прислать распакованными */
            .filter((d) => {
                return !!d && unpack.indexOf(d) === -1;
            })
            /** Убираем дубликаты зависимостей */
            .forEach((d) => {
                if (deps.indexOf(d) === -1) {
                    deps.push(d);
                }
            });

        const files: ICollectedFiles = {
            js: [],
            css: { themedCss: [], simpleCss: [] },
            tmpl: [],
            wml: [],
        };
        const allDeps: ICollectedDepsRaw = {};
        collectDependencies(allDeps, deps, this.modDeps, this.modInfo);

        // Add i18n dependencies
        if (allDeps.hasOwnProperty('i18n')) {
            this.collectI18n(files, allDeps);
        }

        // Find all bundles, and removes dependencies that are included in bundles
        const packages = getAllPackagesNames(
            allDeps,
            unpack,
            this.getBundlesRoute()
        );

        for (const key in packages.js) {
            if (packages.js.hasOwnProperty(key)) {
                files.js.push(key);
            }
        }
        for (const key in packages.tmpl) {
            if (packages.tmpl.hasOwnProperty(key)) {
                files.tmpl.push(key);
            }
        }
        for (const key in packages.wml) {
            if (packages.wml.hasOwnProperty(key)) {
                files.wml.push(key);
            }
        }
        for (const key in packages.css.themedCss) {
            if (packages.css.themedCss.hasOwnProperty(key)) {
                files.css.themedCss.push(key);
            }
        }
        for (const key in packages.css.simpleCss) {
            if (packages.css.simpleCss.hasOwnProperty(key)) {
                files.css.simpleCss.push(key);
            }
        }
        return files;
    }

    /**
     * Добавляет ресурсы локализации, которые надо подключить в вёрстку.
     * @param files {ICollectedFiles} - набор файлов для добавления в вёрстку
     * @param deps {ICollectedDeps} - набор зависимостей, которые участвовали в построение страницы.
     */
    collectI18n(files: ICollectedFiles, deps: ICollectedDepsRaw): void {
        const loadedContexts = controller.loadingsHistory.contexts;
        const localeCode = controller.currentLocale;
        const langCode = controller.currentLang;
        const processedContexts = [];
        const currentBundlesRoute = this.getBundlesRoute();

        // Добавляем конфигурацию локали.
        files.js.push(controller.loadingsHistory.locales[localeCode]);

        for (const moduleModule of Object.keys(deps.i18n)) {
            const UIModuleName =
                deps.i18n[moduleModule].moduleName.split('/')[0];

            if (processedContexts.includes(UIModuleName)) {
                continue;
            }

            processedContexts.push(UIModuleName);

            if (!loadedContexts.hasOwnProperty(UIModuleName)) {
                continue;
            }

            const loadedResources = loadedContexts[UIModuleName];

            if (
                controller.loadingsHistory.contents.hasOwnProperty(UIModuleName)
            ) {
                // Добавляем contents для модулей с внешних сервисов, с информацией о доступных ресурсах локализации.
                files.js.push(
                    controller.loadingsHistory.contents[UIModuleName]
                );
            }

            if (loadedResources.hasOwnProperty(localeCode)) {
                this.addLocalizationResource(
                    currentBundlesRoute,
                    files,
                    loadedResources[localeCode]
                );

                continue;
            }

            if (loadedResources.hasOwnProperty(langCode)) {
                this.addLocalizationResource(
                    currentBundlesRoute,
                    files,
                    loadedResources[langCode]
                );
            }
        }
    }

    private addLocalizationResource(
        currentBundlesRoute: {},
        files: ICollectedFiles,
        availableResources: ILocalizationResources
    ): void {
        if (
            availableResources.dictionary &&
            !currentBundlesRoute.hasOwnProperty(availableResources.dictionary)
        ) {
            files.js.push(availableResources.dictionary);
        }

        if (
            availableResources.style &&
            !currentBundlesRoute.hasOwnProperty(availableResources.style)
        ) {
            files.css.simpleCss.push(availableResources.style);
        }
    }

    getBundlesRoute(): {} {
        if (
            this.optionalBundles &&
            (cookie.get('optionalBundles') === 'true' ||
                getConfig('optionalBundles') === 'true')
        ) {
            return { ...this.bundlesRoute, ...this.optionalBundles };
        }
        return this.bundlesRoute;
    }
}
