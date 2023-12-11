/**
 * Библиотека для настройки адаптивности сайта к различным аспектам адаптивности
 * @see https://n.sbis.ru/wasaby/knowledge#toc_2eb25e0a-c867-45a8-a13d-b8c1ff12cdbc
 * @library UICore/Adaptive
 * @public публичная библиотека
 */

export {
    DEFAULT_BREAKPOINTS,
    AdaptiveContainer,
    AdaptiveInitializer,
    AdaptiveModeType,
    useAdaptiveMode,
    withAdaptiveMode,
    getAdaptiveModeForLoaders,
    unsafe_getRootAdaptiveMode,
    ScrollOnBodyStore,
} from 'UICore/Adaptive';
export { default as BodyScroll } from './_adaptive/BodyScrollHOC';
