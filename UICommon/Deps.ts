/**
 * Библиотека для работы с зависимостями на странице
 * @library UICommon/Deps
 * @includes isModuleExists UICommon/_deps/InitModulesDependencies#isModuleExists
 * @includes executeSyncOrAsync UICommon/_deps/executeSyncOrAsync
 * @includes addPageDeps UICommon/_deps/PageDependencies#addPageDeps
 * @embedded
 */

export {
    isModuleExists,
    getOptionalBundles,
} from './_deps/InitModulesDependencies';
export { default as executeSyncOrAsync } from './_deps/executeSyncOrAsync';
export { addPageDeps, collectDependencies } from './_deps/PageDependencies';
