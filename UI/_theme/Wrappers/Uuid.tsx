/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { memo, useState, useEffect } from 'react';
import getThemeStorage from '../ThemeStorage';
import { logger } from 'Application/Env';
import createThemeScope from 'UI/_theme/context';
import type { IActiveTheme } from 'UI/theme/controller';

const RootThemeScope = createThemeScope();
const MemoThemeScope = memo(RootThemeScope);

type TUuid = string;
interface IThemeWrapperUuidProps {
    uuid: TUuid;
    children: JSX.Element;
    isUpperScope: boolean;
    /**
     * в popup не внедрено отображение фона
     *  https://online.sbis.ru/opendoc.html?guid=db38d223-4ea4-4f25-bcf8-e8d8658f7a54&client=3
     * @private
    */
    noBackground88221033455786?: boolean;
}

export default function ThemeWrapperUuid({uuid, children, isUpperScope, noBackground88221033455786 }: IThemeWrapperUuidProps) {
    const themeStorage = getThemeStorage();
    const theme = themeStorage.getThemeByUuid(uuid);
    const [activeTheme, setActiveTheme] = useState<IActiveTheme | undefined>();
    useEffect(() => {
        logger.warn('Используется загрузка темы по uuid! ThemeUUID!')
        if (!theme) {
            themeStorage.loadTheme({ uuid }).then(setActiveTheme);
        }
    }, [uuid]);
    return (
        <MemoThemeScope
            activeTheme={theme || activeTheme}
            isUpperScope={isUpperScope}
            noBackground88221033455786={noBackground88221033455786}
        >
            {children}
        </MemoThemeScope>
    );
}
ThemeWrapperUuid.displayName = 'UI/Theme:ThemeWrapperUuid';

export function isUuid(theme: IActiveTheme | TUuid | undefined): theme is TUuid {
    return typeof theme === 'string';
}
