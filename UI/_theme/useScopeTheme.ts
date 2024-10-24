import { useMemo, useRef } from 'react';
import { useThemeEffect } from './useThemeEffect';
import { getThemeController } from 'UICommon/ThemeInitializer';
import { IActiveTheme, TClassList, THEME_APPLICATIONS } from 'UICommon/theme/controller';
/**
 * Хук для вставки css темы.
 * @param activeTheme
 * @returns activeTheme
 * @private
 */
export function useScopeTheme(
    activeTheme?: IActiveTheme | IActiveTheme[]
): [IActiveTheme | undefined, TClassList] {
    const themeArr = useMemo(() => {
        return Array.isArray(activeTheme) ? activeTheme : [activeTheme];
    }, [activeTheme]);
    const appliedStylesSet = useRef<Set<string>>(new Set());
    useThemeEffect(() => {
        const themeController = getThemeController();
        for (const theme of themeArr) {
            const selector = theme?.selector;
            if (!selector) {
                continue;
            }
            const key = `${selector}:${theme.version}`;
            if (!appliedStylesSet.current.has(key)) {
                appliedStylesSet.current.add(key);
                themeController.applyStyles(theme);
            }
        }
    }, [themeArr]);

    const result: [IActiveTheme | undefined, TClassList] = useMemo(() => {
        let firstPalleteTheme: IActiveTheme | undefined;
        const fullClassList: TClassList = [];
        for (const theme of themeArr) {
            if (!theme) {
                continue;
            }
            if (!firstPalleteTheme && theme.themeApply === THEME_APPLICATIONS.palette) {
                firstPalleteTheme = theme;
            }
            if (theme.classList?.length) {
                for (const className of theme.classList) {
                    fullClassList.push(className);
                }
            }
        }

        return [firstPalleteTheme, fullClassList];
    }, [themeArr]);

    return result;
}
