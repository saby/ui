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
export { applyBodyScroll } from './_adaptive/ScrollOnBody';
