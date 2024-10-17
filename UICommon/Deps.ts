/**
 * Библиотека для работы с зависимостями на странице
 * @library UICommon/Deps
 * @embedded
 */

export { isModuleExists, getOptionalBundles } from './_deps/InitModulesDependencies';
export { default as executeSyncOrAsync } from './_deps/executeSyncOrAsync';
export { addPageDeps, collectDependencies } from './_deps/PageDependencies';
