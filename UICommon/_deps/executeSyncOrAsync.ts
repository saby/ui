import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import pageDependencies from './PageDependencies';

/**
 * Для некоторых контролов на сервере существует потребность грузить зависимости по заранее недетерминированному
 * условию так, как будто бы они указаны в зависимости RequireJS для define.
 * Иными словами - для контрола это должно выглядеть синхронно на сервере.
 * На сервере загрузка будет происходить синхронно. Указанные зависимости также будут добавляться
 * к зависимостям страницы. На клиенте загрузка будет происходить синхронно только в том случае,
 * если все указанные зависимости уже загружены средствами RequireJS
 * @param deps массив требуемых зависимостей.
 * @param callback код, который нужно выполнить после резолва всех зависимостей. Функция.
 * Формальными аргументами в функцию будут поступать зарезолвленные зависимости в порядке из указания в массиве deps
 */
export default function executeSyncOrAsync(
    deps: string[],
    callback: Function
): Promise<void> | void {
    if (typeof window === 'undefined') {
        pageDependencies.addPageDeps(deps);
        callback.apply(null, deps.map(ModulesLoader.loadSync));
        return;
    }

    let hasPromise: boolean = false;
    const loadData = deps.map((moduleName) => {
        if (ModulesLoader.isLoaded(moduleName)) {
            return ModulesLoader.loadSync(moduleName);
        }

        hasPromise = true;
        return ModulesLoader.loadAsync(moduleName);
    });

    if (hasPromise) {
        return Promise.all(loadData).then((loadedDeps: unknown[]) => {
            callback.apply(null, loadedDeps);
        });
    }

    callback.apply(null, loadData);
}
