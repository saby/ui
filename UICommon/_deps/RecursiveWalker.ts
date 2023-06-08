import {
    DEPTYPES,
    ICollectedDepsRaw,
    IDepCSSPack,
    IDepPackages,
    IDeps,
    IModuleInfo,
    IPlugin,
    RequireJSPlugin,
    TYPES,
} from 'UICommon/_deps/Interface';
import { Logger } from 'UICommon/Utils';
import * as Library from 'WasabyLoader/Library';

/**
 * Соответствие плагина i18n библиотеке I18n/i18n
 * Плагин i18n requirejs по сути это то же самое, что и библиотека I18n/i18n
 * но DepsCollector не знает об этом ничего.
 */
const SPECIAL_DEPS = {
    i18n: 'I18n/i18n',
};
/**
 * Название модуля WS.Core, который будет указан в s3debug при частичном дебаге
 */
const WSCORE_MODULE_NAME = 'WS.Core';
/**
 * Префиксы модулей из "семейства" модулей WS.Core
 * При частичном дебаге WS.Core необходимо выбрасывать модули с префиксом из списка
 */
const WSCORE_MODULES_PREFIXES = ['Core/', 'Lib/', 'Transport/'];

/**
 * Рекурсивно проходит по всему дереву зависимостей и создает объект со списком всех зависимостей заданных модулей
 * { js: {}, css: {}, ..., wml: {} }
 * @param allDeps
 * @param curNodeDeps
 * @param modDeps
 */
export function collectDependencies(
    allDeps: ICollectedDepsRaw,
    curNodeDeps: IDeps,
    modDeps: Record<string, IDeps>,
    modInfo: object,
    features: Record<string, string>,
    skipDep: boolean = false
): void {
    if (!curNodeDeps || !curNodeDeps.length) {
        return;
    }
    for (let i = 0; i < curNodeDeps.length; i++) {
        let node = curNodeDeps[i];
        const splitted = node.split('!');
        if (splitted[0] === 'optional' && splitted.length > 1) {
            // OPTIONAL BRANCH
            splitted.shift();
            node = splitted.join('!');
            if (!modInfo[node]) {
                continue;
            }
        }
        const module = parseModuleName(node);
        if (module === null) {
            // Модули данного типа, мы не умеем подключать.
            continue;
        }
        const moduleType = module.typeInfo.type;
        if (!allDeps[moduleType]) {
            allDeps[moduleType] = {};
        }
        if (!allDeps[moduleType][node]) {
            if (!(skipDep && !!module.typeInfo.canBePackedInParent)) {
                allDeps[moduleType][module.fullName] = module;
            }
            if (module.typeInfo.hasDeps) {
                let nodeDeps = modDeps[node] || modDeps[module.moduleName];
                if (features[node]) {
                    nodeDeps = [...nodeDeps, features[node]];
                }
                collectDependencies(
                    allDeps,
                    nodeDeps,
                    modDeps,
                    modInfo,
                    features,
                    !!module.typeInfo.packOwnDeps
                );
            }
        }
    }
}

/**
 * Разложение собранного списка зависимостей по типам и учитывая их расположение в бандле
 */
export function getAllPackagesNames(
    all: ICollectedDepsRaw,
    unpack: IDeps,
    bRoute: Record<string, string>
): IDepPackages {
    const packs = getEmptyPackages();
    const isUnpackModule = getIsUnpackModule(unpack);
    mergePacks(packs, getPacksNames(all.js, isUnpackModule, bRoute));
    mergePacks(packs, getPacksNames(all.tmpl, isUnpackModule, bRoute));
    mergePacks(packs, getPacksNames(all.wml, isUnpackModule, bRoute));

    packs.css = getCssPackages(all.css, isUnpackModule, bRoute);
    return packs;
}

function parseModuleName(name: string): IModuleInfo | null {
    const typeInfo = getType(name);
    if (typeInfo === null) {
        return null;
    }
    let nameWithoutPlugin;
    if (typeInfo.plugin) {
        nameWithoutPlugin = name.split(typeInfo.plugin + '!')[1];
    } else {
        nameWithoutPlugin = name;
    }
    const parts = Library.parse(nameWithoutPlugin);
    return {
        moduleName: parts.name,
        fullName: name,
        typeInfo,
    };
}

function getEmptyPackages(): IDepPackages {
    const packages = {};
    for (const key in TYPES) {
        if (TYPES.hasOwnProperty(key)) {
            packages[key as RequireJSPlugin] = {};
        }
    }
    return packages as IDepPackages;
}

function getPacksNames(
    allDeps: ICollectedDepsRaw = {},
    isUnpackModule: (key: string) => boolean,
    bundlesRoute: Record<string, string> = {}
): IDepPackages {
    const unpackBundles: string[] = [];
    const packages = getEmptyPackages();
    for (const moduleName of Object.keys(allDeps)) {
        let bundleName = bundlesRoute[moduleName];
        if (!bundleName && SPECIAL_DEPS.hasOwnProperty(moduleName)) {
            bundleName = bundlesRoute[SPECIAL_DEPS[moduleName]];
        }
        if (!bundleName) {
            continue;
        }
        delete allDeps[moduleName];
        const ext = getExt(bundleName);
        const packageName = getPackageName(bundleName);
        if (unpackBundles.indexOf(packageName) !== -1) {
            continue;
        }

        // Не пакуем также в вёрстку скрипты для модулей, которые упакованы во
        // внешние интерфейсные модули. Ярким представителем такого модуля служит
        // модуль Superbundles, который упаковывает в себя половину платформы из
        // различных интерфейсных модулей.
        if (isUnpackModule(moduleName) || isUnpackModule(packageName)) {
            unpackBundles.push(packageName);
            delete packages[ext][packageName];
            continue;
        }
        packages[ext][packageName] = DEPTYPES.BUNDLE;
    }

    for (const moduleName of Object.keys(allDeps)) {
        const { plugin, type: ext } = allDeps[moduleName].typeInfo;
        const packageName = plugin ? moduleName.split(plugin + '!').pop() : moduleName;
        if (unpackBundles.indexOf(packageName) !== -1) {
            continue;
        }
        if (isUnpackModule(moduleName)) {
            unpackBundles.push(packageName);
            delete packages[ext][packageName];
            continue;
        }
        packages[ext][packageName] = DEPTYPES.SINGLE;
    }
    return packages;
}

function getCssPackages(
    allDeps: ICollectedDepsRaw,
    isUnpackModule: (key: string) => boolean,
    bundlesRoute: Record<string, string>
): IDepCSSPack {
    const packages = {
        themedCss: {},
        simpleCss: {},
    };
    const unpackBundles: string[] = [];
    for (const key in allDeps) {
        if (allDeps.hasOwnProperty(key)) {
            const noParamsName = removeThemeParam(key);
            const bundleName = bundlesRoute[noParamsName];
            if (bundleName) {
                delete allDeps[key];
                const packageName = getPackageName(bundleName);
                if (unpackBundles.indexOf(packageName) !== -1) {
                    continue;
                }
                const ext = isThemedCss(key) ? 'themedCss' : 'simpleCss';
                if (isUnpackModule(key)) {
                    unpackBundles.push(packageName);
                    delete packages[ext][packageName];
                    continue;
                }
                packages[ext][packageName] = DEPTYPES.BUNDLE;
            }
        }
    }
    for (const key in allDeps) {
        if (allDeps.hasOwnProperty(key)) {
            const noParamsName = removeThemeParam(key).split('css!')[1];
            if (unpackBundles.indexOf(noParamsName) !== -1) {
                continue;
            }
            const ext = isThemedCss(key) ? 'themedCss' : 'simpleCss';
            if (isUnpackModule(key)) {
                unpackBundles.push(noParamsName);
                delete packages[ext][noParamsName];
                continue;
            }
            packages[ext][noParamsName] = DEPTYPES.SINGLE;
        }
    }
    return packages;
}

/**
 * Возвращает метод, который для переданного модуля будет выяснять нужно его бандл добавлять в страницу или нет
 * Нужен при частичном дебаге, когда в s3debug указан список модулей
 * @param unpack список модулей, которые указаны в s3debug
 */
function getIsUnpackModule(unpack: IDeps): (moduleName: string) => boolean {
    // проверка модуля из семейства WS.Core
    const isWsCore = (unpackModuleName, dependModuleName): boolean => {
        if (unpackModuleName !== WSCORE_MODULE_NAME) {
            return false;
        }
        return WSCORE_MODULES_PREFIXES.some((modulePrefix: string) => {
            return dependModuleName.startsWith(modulePrefix);
        });
    };

    return (dependModuleName: string): boolean => {
        return unpack.some((unpackModuleName) => {
            return (
                dependModuleName.indexOf(unpackModuleName) !== -1 ||
                isWsCore(unpackModuleName, dependModuleName)
            );
        });
    };
}

function mergePacks(result: IDepPackages, addedPackages: Partial<IDepPackages>): void {
    for (const pack in addedPackages) {
        if (addedPackages.hasOwnProperty(pack)) {
            if (result[pack] === undefined) {
                result[pack] = {};
            }
            for (const key in addedPackages[pack]) {
                if (addedPackages[pack].hasOwnProperty(key)) {
                    result[pack][key] = addedPackages[pack][key];
                }
            }
        }
    }
}

function getType(name: string): IPlugin | null {
    const plugin = getPlugin(name);
    for (const key in TYPES) {
        if (TYPES[key].plugin === plugin) {
            return TYPES[key];
        }
    }
    return null;
}

function getPlugin(name: string): string {
    let res;
    res = name.split('!')[0];
    if (res === name) {
        res = '';
    }
    return res;
}

function getPackageName(packageLink: string): string {
    return packageLink.replace(/^(\/resources\/|resources\/)+/, '').replace(/\.min\.(css|js)$/, '');
}

function getExt(fileName: string): string {
    const res = fileName.match(/\.\w+$/);
    if (res && res.length) {
        return res[0].slice(1);
    }

    const message = `[UICommon/_deps/RecursiveWalker:getExt] Incorrect extension: ${fileName}`;
    Logger.error(message);
    return '';
}

function isThemedCss(key: string): boolean {
    return key.indexOf('theme?') >= 0;
}

function removeThemeParam(name: string): string {
    return name.replace('theme?', '');
}
