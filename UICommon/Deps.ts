/// <amd-module name="UICommon/Deps" />

/**
 * Библиотека для работы с зависимостями на странице
 * @library UICommon/Deps
 * @includes addPageDeps UICommon/_deps/HeadData
 * @author Мустафин Л.И.
 */

export { isModuleExists } from './_deps/RecursiveWalker';
export { ICollectedDeps } from './_deps/Interface';
import HeadData, { headDataStore, addPageDeps, executeSyncOrAsync } from './_deps/HeadData';
import { DepsCollector } from './_deps/DepsCollector';

export {
    HeadData,
    headDataStore,
    executeSyncOrAsync,
    addPageDeps,
    DepsCollector
};
