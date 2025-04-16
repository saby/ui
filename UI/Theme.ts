/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
/**
 * Библиотека содержащая базовые механизмы темизации
 * @library UI/Theme
 * @includes ThemeBackground UI/_theme/ThemeBackground
 * @includes BackgroundViewer UI/_theme/BackgroundViewer
 * @includes Background UI/_theme/Background
 * @includes ThemeDesigner UI/_theme/Designe
 * @includes ThemeWrapper UI/_theme/Wrapper
 * @includes useActiveTheme UI/_theme/useActiveTheme
 * @includes useThemeScheme UI/_theme/useThemeScheme
 * @includes controller UI/theme/controller
 * @public
 */
export { IActiveTheme } from 'UI/theme/controller';
export { default as ThemeBackground } from 'UI/_theme/ThemeBackground';
export {
    default as BackgroundViewer,
    isLight,
    LIGHT_CLASS,
    DARK_CLASS,
} from 'UI/_theme/BackgroundViewer';
export { default as Background } from 'UI/_theme/Background';
export { IBackground } from 'UI/_theme/background/IBackground';
export { ThemeContext } from 'UI/_theme/context';
export { default as ThemeConsumer } from 'UI/_theme/Consumer';
export { default as ThemeDesigner } from 'UI/_theme/Designer';
export { default as getThemeStorage } from 'UI/_theme/ThemeStorage';
export { default as ThemeWrapper, ERROR_FALLBACK_SELECTOR } from 'UI/_theme/Wrapper';
export type { IThemeWrapperOptions, IErrorActiveTheme } from 'UI/_theme/Wrapper';
export type { IBackgroundViewer } from 'UI/_theme/BackgroundViewer';
export { useActiveTheme } from 'UI/_theme/useActiveTheme';
export { useThemeScheme } from 'UI/_theme/useThemeScheme';
