/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
/**
 * Библиотека для настройки адаптивности
 * @library UICore/Adaptive
 * @public публичная библиотека
 */

export { AdaptiveModeType } from './_adaptive/AdaptiveModeClass';
export { AdaptiveInitializer } from './_adaptive/AdaptiveInitializer';
export { DEFAULT_BREAKPOINTS } from './_adaptive/AdaptiveModeClass';
export { AdaptiveContainer } from './_adaptive/AdaptiveContainer';
export {
    getAdaptiveModeForLoaders,
    unsafe_getRootAdaptiveMode,
} from './_adaptive/AdaptiveInitializer';

export { AdaptiveModeClass as _AdaptiveModeClass } from './_adaptive/AdaptiveModeClass';
export { WindowSizeTracker as _WindowSizeTracker } from './_adaptive/SizeTracker';
export { useAdaptiveMode, withAdaptiveMode } from './_adaptive/withAdaptiveMode';
export { applyBodyScroll, moveBodyScroll, unMoveBodyScroll } from './_adaptive/ScrollOnBody';
export { default as ScrollOnBodyStore } from './_adaptive/ScrollOnBodyStore';
export { Storage } from './_adaptive/Aspects';
export { default as BodyScroll } from './_adaptive/BodyScrollHOC';
