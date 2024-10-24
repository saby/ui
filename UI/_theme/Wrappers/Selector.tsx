/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { memo, useState, useEffect } from 'react';
import getThemeStorage from '../ThemeStorage';
import createThemeScope from 'UI/_theme/context';
import type { IActiveTheme } from 'UI/theme/controller';

const RootThemeScope = createThemeScope();
const MemoThemeScope = memo(RootThemeScope);

interface IProps {
    selector: string | readonly string[];
    children: JSX.Element;
    isUpperScope: boolean;
}

export default function ThemeWrapperSelector({ selector, children, isUpperScope }: IProps) {
    const themeStorage = getThemeStorage();
    // eslint-disable-next-line react/hook-use-state
    const [_version, setVersion] = useState(0);
    const selectors: readonly string[] = Array.isArray(selector) ? selector : [selector];
    const loadedThemes: IActiveTheme[] = [];
    const selectorsToClientLoad: string[] = [];
    for (const themeSelector of selectors) {
        const theme = themeStorage.getTheme(themeSelector);
        if (theme) {
            loadedThemes.push(theme);
            continue;
        }
        selectorsToClientLoad.push(themeSelector);
    }
    useEffect(() => {
        if (!selectorsToClientLoad.length) {
            return;
        }

        // После загрузки все темы добавятся в стор. Так что нет смысле хранить их в стейте.
        // Достаточно вызвать перерисовку, а дальше loadedThemes пересчитаются из стора.
        Promise.all(
            selectorsToClientLoad.map((notLoadedTheme) =>
                themeStorage.loadTheme({ selector: notLoadedTheme })
            )
        ).then(() => setVersion((prevVersion) => prevVersion + 1));
    }, [selector]);

    return (
        <MemoThemeScope activeTheme={loadedThemes} isUpperScope={isUpperScope}>
            {children}
        </MemoThemeScope>
    );
}
ThemeWrapperSelector.displayName = 'UI/Theme:ThemeWrapperSelector';
