import { useContext } from 'react';
import { ThemeContext } from './context';
import getThemeStorage from './ThemeStorage';
import type { IActiveTheme } from 'UICommon/theme/controller';

export function useActiveTheme(): IActiveTheme | undefined {
    const context = useContext(ThemeContext);
    const selector = context.theme;
    const activeTheme = selector ? getThemeStorage().getTheme(selector) : undefined;
    return activeTheme;
}
