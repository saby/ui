import { useContext, useMemo } from 'react';
import { ThemeContext } from './context';
import getThemeStorage from './ThemeStorage';
import type { IActiveTheme } from 'UICommon/theme/controller';

export function useActiveTheme(): IActiveTheme | undefined {
    const context = useContext(ThemeContext);
    const activeTheme = useMemo(() => {
        // Есть подозрение, что текущий формат контекста не самый удобный.
        // Чтобы применить тему из контекста, нужно получить её из стора по имени.
        if (context?.theme) {
            const activeTheme = getThemeStorage().getTheme(context.theme);
            return activeTheme;
        }
    }, [context?.theme, context?.cacheId]);
    return activeTheme;
}
