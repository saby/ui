/// <amd-module name="UICommon/_deps/HeadData" />
import { constants } from 'Env/Env';
import { getDebugDeps, getDepsCollectorParams, getUnpackDepsFromCookie, isDebug } from 'UICommon/_deps/RecursiveWalker';
import * as Library from 'WasabyLoader/Library';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { DepsCollector } from './DepsCollector';
import * as AppEnv from 'Application/Env';
import { IStore } from 'Application/Interface';
import { IResources, ICollectedDeps, ISerializedData, ICollectedFiles, IDeps } from './Interface';

const { links, nodes, bundles } = getDepsCollectorParams();
const depsCollector = new DepsCollector(links, nodes, bundles);

/**
 * Компонент-состояние head страницы
 * Собирает ресурсы страницы,
 */
// tslint:disable-next-line:no-any
export default class HeadData implements IStore<Record<keyof HeadData, any>> {
    // переедет в константы реквеста, изменяется в Controls/Application
    isNewEnvironment: boolean = false;
    /** Дополнительные модули, для которых следует собрать зависимости */
    private initDeps: Record<string, boolean> = {};
    /** Дополнительные модули, которые следует грузить отложенно */
    private lazyInitDeps: Record<string, boolean> = {};
    private resolve: Function = null;
    // tslint:disable-next-line:no-any
    private renderPromise: Promise<ICollectedDeps> = null;
    /**
     * Непакуемые require-зависимости
     */
    private unpackDeps: IDeps = [];

    /**
     * Уже подключенные через rt-пакеты, статические бандлы ресурсы
     */
    private includedResources: { links: IDeps, scripts: IDeps; } = { links: [], scripts: [] };
    constructor() {
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.getKeys = this.getKeys.bind(this);
        this.toObject = this.toObject.bind(this);
        this.collectDeps = this.collectDeps.bind(this);
        this.collectDependencies = this.collectDependencies.bind(this);
        this.setUnpackDeps = this.setUnpackDeps.bind(this);
        this.pageContentBuilded = this.pageContentBuilded.bind(this);
        this.pushDepComponent = this.pushDepComponent.bind(this);
        this.resetRenderDeferred = this.resetRenderDeferred.bind(this);
        this.setIncludedResources = this.setIncludedResources.bind(this);

        this.resetRenderDeferred();
    }

    isDebug(): boolean {
        return isDebug();
    }

    private _collect(initDeps: IDeps = [], unpackRtPackDeps: IDeps): ICollectedFiles {
        if (this.isDebug()) {
            return getDebugDeps(initDeps);
        }
        const unpack = getUnpackDepsFromCookie().concat(unpackRtPackDeps);
        return depsCollector.collectDependencies(initDeps, unpack);
    }

    /* toDO: StateRec.register */
    /**
     * добавить зависимость страницы
     */
    pushDepComponent(componentName: string, lazyLoading: boolean = false): void {
        if (!componentName) {
            return;
        }
        this.initDeps[componentName] = true;
        if (lazyLoading) {
            this.lazyInitDeps[componentName] = true;
        }
    }

    /**
     * Установка непакуемых зависимостей
     * @param unpack
     */
    setUnpackDeps(unpack: IDeps): void {
        this.unpackDeps = unpack;
    }

    /**
     * Установка дополнительных ресурсов
     * @param resources
     */
    setIncludedResources(resources: IResources): void {
        const scripts = resources.scripts.map((l) => l.src);
        const links = resources.links.map((l) => l.href);
        this.includedResources = { links, scripts };
    }

    /**
     * Коллекция зависимостей
     * @param tempLoading
     */
    collectDeps(tempLoading: Promise<void>): void {
        tempLoading.then(() => {
            if (!this.resolve) {
                return;
            }
            this.resolve(this.collectDependencies());
            this.resolve = null;
        });
    }

    collectDependencies(): ICollectedDeps {
        const { additionalDeps, serialized: rsSerialized } = getSerializedData();
        const deps = Object.keys({ ...additionalDeps, ...this.initDeps });
        const files = this._collect(deps, this.unpackDeps);
        // некоторые разработчики завязываются на порядок css, поэтому сначала css переданные через links
        const simpleCss = this.includedResources.links.concat(files.css.simpleCss);
        // TODO нельзя слить ссылки и имена модулей т.к LinkResolver портит готовые ссылки
        // TODO временно прокидываю их раздельно
        return {
            scripts: this.includedResources.scripts, // готовые ссылки на js
            js: files.js, // названия js модулей
            css: { simpleCss, themedCss: files.css.themedCss },
            tmpl: files.tmpl,
            wml: files.wml,
            rsSerialized,
            rtpackModuleNames: this.unpackDeps,
            additionalDeps: deps
        };
    }

    pageContentBuilded(): Promise<ICollectedDeps> {
        return this.renderPromise;
    }

    resetRenderDeferred(): void {
        this.renderPromise = new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    // #region IStore
    get<K extends keyof HeadData>(key: K): HeadData[K] {
        return this[key];
    }
    set<K extends keyof HeadData>(key: K, value: this[K]): boolean {
        try {
            this[key] = value;
            return true;
        } catch (_e) {
            return false;
        }
    }
    // tslint:disable-next-line:no-empty
    remove(): void { }
    getKeys(): KeyHeadData[] {
        return Object.keys(this) as KeyHeadData[];
    }
    // tslint:disable-next-line:no-any
    toObject(): Record<keyof HeadData, any> {
        return Object.assign({}, this);
    }
    // #endregion
}

class HeadDataStore {
    constructor(private readonly storageKey: string) { }

    read<K extends keyof HeadData>(key: K): HeadData[K] {
        return AppEnv.getStore<HeadData>(this.storageKey, () => new HeadData()).get(key);
    }

    write<K extends keyof HeadData>(key: K, value: HeadData[K]): boolean {
        return AppEnv.getStore<HeadData>(this.storageKey, () => new HeadData()).set(key, value);
    }
}
/**
 * Singleton для работы со HeadData Store.
 */
export const headDataStore = new HeadDataStore('HeadData');

/**
 * Добавить модуль в зависимости страницы.
 * Метод актуален только на СП.
 * @function
 * @param modules список с названиями модулей, в обычном (Foo/bar) или библиотечном (Foo/bar:baz) синтаксисе
 * @public
 */
export function addPageDeps(modules: string[]): void {
    if (constants.isBrowserPlatform || !modules || !modules.length) {
        return;
    }
    modules.forEach((moduleName) => {
        const parsedInfo: {name: string} = Library.parse(moduleName);
        headDataStore.read('pushDepComponent')(parsedInfo.name);
    });
}

/**
 * Для некоторых контролов на сервере существует потребность грузить зависимости по заранее недетерминированному
 * условию так, как будто бы они указаны в зависимости RequireJS для define.
 * Иными словами - для контрола это должно выглядеть синхронно на сервере.
 * На сервере загрузка будет происходить синхронно. Указанные зависимости также будут добавляться
 * к зависимостям страницы. На клиенте загрузка будет происходить синхронно только в том случае,
 * если все указанные зависимости уже загружены средствами RequireJS
 * @param deps массив требуемых зависимостей.
 * @param code код, который нужно выполнить после резолва всех зависимостей. Функция.
 * Формальными аргументами в функцию будут поступать зарезолвленные зависимости в порядке из указания в массиве deps
 */
export function executeSyncOrAsync(deps: string[], code: Function): Promise<void> | void {
    if (constants.isServerSide) {
        addPageDeps(deps);
        code.apply(null, deps.map(ModulesLoader.loadSync));
        return;
    }

    let hasPromise: boolean = false;
    const loadData = deps.map((moduleName) => {
        if (ModulesLoader.isLoaded(moduleName)) {
            return ModulesLoader.loadSync(moduleName);
        }

        hasPromise = true;
        return import(moduleName);
    });

    if (hasPromise) {
        return Promise.all(loadData).then((loadedDeps: unknown[]) => {
            code.apply(null, loadedDeps);
        });
    }

    code.apply(null, loadData);
}

function getSerializedData(): ISerializedData {
    return AppEnv.getStateReceiver().serialize();
}

type KeyHeadData = keyof HeadData;
