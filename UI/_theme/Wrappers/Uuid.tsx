/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { memo, useState, useEffect } from 'react';
import getThemeStorage from '../ThemeStorage';
import createThemeScope from 'UI/theme/context';
import type { IActiveTheme } from 'UI/theme/controller';


const RootThemeScope = createThemeScope();
const MemoThemeScope = memo(RootThemeScope);

type TUuid = string;
interface IThemeWrapperUuidProps {
    uuid: TUuid;
    children: JSX.Element;
}

export default function ThemeWrapperUuid({ uuid, children }: IThemeWrapperUuidProps) {
    const themeStorage = getThemeStorage();
    const theme = themeStorage.getThemeByUuid(uuid);
    const [activeTheme, setActiveTheme] = useState<IActiveTheme | undefined>(theme);
    useEffect(() => {
        if (!theme) {
            themeStorage.loadTheme({ uuid }).then(setActiveTheme);
        }
    }, [uuid]);
    return <MemoThemeScope activeTheme={ activeTheme }>
        { children }
    </MemoThemeScope>;
}
ThemeWrapperUuid.displayName = 'UI/Theme:ThemeWrapperUuid';

export function isUuid(theme: IActiveTheme | TUuid | undefined): theme is TUuid {
    return typeof theme === 'string';
}
