/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { memo, useState, useEffect } from 'react';
import getThemeStorage from '../ThemeStorage';
import createThemeScope from 'UI/theme/context';
import type { IActiveTheme } from 'UI/theme/controller';


const RootThemeScope = createThemeScope();
const MemoThemeScope = memo(RootThemeScope);

interface IProps {
    selector: string;
    children: JSX.Element;
}

export default function ThemeWrapperSelector({ selector, children }: IProps) {
    const themeStorage = getThemeStorage();
    const theme = themeStorage.getTheme(selector);
    const [activeTheme, setActiveTheme] = useState<IActiveTheme | undefined>(theme);
    useEffect(() => {
        if (!theme) {
            themeStorage.loadTheme({ selector }).then(setActiveTheme);
        }
    }, [selector]);
    return <MemoThemeScope activeTheme={ activeTheme }>
        { children }
    </MemoThemeScope>;
}
ThemeWrapperSelector.displayName = 'UI/Theme:ThemeWrapperSelector';
