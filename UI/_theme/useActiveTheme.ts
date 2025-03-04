/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useContext } from 'react';
import { ThemeContext } from './context';
import getThemeStorage from './ThemeStorage';
import type { IActiveTheme } from 'UICommon/theme/controller';

/**
 * Хук получения текущей активной темы.
 */
export function useActiveTheme(): IActiveTheme | undefined {
    const context = useContext(ThemeContext);
    const selector = context.theme;
    const activeTheme = selector ? getThemeStorage().getTheme(selector) : undefined;
    return activeTheme;
}
