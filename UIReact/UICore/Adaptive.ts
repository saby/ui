/**
 * Библиотека для настройки адаптивности сайта к ширине видимой области браузера.
 * @library UICore/Adaptive
 * @public публичная библиотека
 */

export { create, CreatorReturnType } from './_adaptive/createAdaptiveMode';
export { AdaptiveModeType, ScreensType } from './_adaptive/AdaptiveModeClass';
export { default as ForcedAdaptiveModeHoc } from './_adaptive/ForcedAdaptiveModeHoc';
