/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
/**
 * Библиотека для настройки адаптивности. ТОЛЬКО ДЛЯ ВНУТРЕННЕГО ИСПОЛЬЗОВАНИЯ В ПЛАТФОРМЕ!
 * @see https://n.sbis.ru/wasaby/knowledge#toc_2eb25e0a-c867-45a8-a13d-b8c1ff12cdbc
 * @library
 * @module
 * @public
 */

export { AdaptiveModeType } from './_adaptive/AdaptiveModeClass';
export { AdaptiveInitializer as AdaptiveInitializerInternal } from './_adaptive/AdaptiveInitializer';
export { DEFAULT_BREAKPOINTS } from './_adaptive/Aspects';
export { AdaptiveContainer } from './_adaptive/AdaptiveContainer';
export { getAdaptiveModeForLoaders } from './_adaptive/AdaptiveInitializer';

export { AdaptiveModeClass as _AdaptiveModeClass } from './_adaptive/AdaptiveModeClass';
export { WindowSizeTracker as _WindowSizeTracker } from './_adaptive/WindowSizeTracker';
export { useAdaptiveMode, withAdaptiveMode } from './_adaptive/withAdaptiveMode';
export {
    applyBodyScroll,
    moveBodyScroll,
    unMoveBodyScroll,
    withForceScrollUnfreeze,
} from './_adaptive/ScrollOnBody';
export { ScrollOnBodyContext } from './_adaptive/ScrollOnBodyContext';
export { ScrollOnBodyContextProvider } from './_adaptive/ScrollOnBodyContextProvider';
export { default as ScrollOnBodyStore } from './_adaptive/ScrollOnBodyStore';
export { Storage, IAspects } from './_adaptive/Aspects';
export { default as BodyScroll } from './_adaptive/BodyScrollHOC';
export { AdaptiveInitializerConfig } from './_adaptive/AdaptiveInitializerConfig';
export { default as PrintDialog } from './_adaptive/PrintDialogHOC';
// только для тестов
export { AdaptiveInitializerConfigContext as _AdaptiveInitializerConfigContext } from './_adaptive/AdaptiveInitializerConfigContext';
