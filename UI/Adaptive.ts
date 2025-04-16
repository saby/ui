/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
/**
 * Библиотека для настройки адаптивности сайта к различным аспектам адаптивности
 * @see https://n.sbis.ru/wasaby/knowledge#toc_2eb25e0a-c867-45a8-a13d-b8c1ff12cdbc
 * @library
 * @module
 * @public
 */

export {
    DEFAULT_BREAKPOINTS,
    AdaptiveContainer,
    AdaptiveInitializerConfig,
    AdaptiveModeType,
    useAdaptiveMode,
    withAdaptiveMode,
    getAdaptiveModeForLoaders,
    ScrollOnBodyStore,
    BodyScroll,
    moveBodyScroll,
    unMoveBodyScroll,
    withForceScrollUnfreeze,
    ScrollOnBodyContext,
    ScrollOnBodyContextProvider,
} from 'UICore/Adaptive';
