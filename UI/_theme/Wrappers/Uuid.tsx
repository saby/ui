/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
/*
 * Содержит логику, которая предназначена для управления темами по уникальному id
 */
import { memo, useState, useEffect } from 'react';
import getThemeStorage from '../ThemeStorage';
import { logger } from 'Application/Env';
import createThemeScope from 'UI/_theme/context';
import type { IActiveTheme } from 'UI/theme/controller';

/**
 * Область видимости для темы
 * @private
 */
const RootThemeScope = createThemeScope();
const MemoThemeScope = memo(RootThemeScope);

/**
 * Тип, представляющий UUID
 * @private
 */
type TUuid = string;

/**
 * Аргументы компонента-обертки темы по uuid
 * @private
 */
interface IThemeWrapperUuidProps {
    /**
     * Уникальный идентификатор темы
     */
    uuid: TUuid;
    /**
     * Дочерние элементы, которые будут обернуты в тему
     */
    children: JSX.Element;
    /**
     * Флаг, указывающий, является ли эта тема верхней областью видимости
     */
    isUpperScope: boolean;
    /**
     * в popup не внедрено отображение фона
     *  https://online.sbis.ru/opendoc.html?guid=db38d223-4ea4-4f25-bcf8-e8d8658f7a54&client=3
     * @private
     */
    noBackground88221033455786?: boolean;
}

/**
 * Компонент, который оборачивает дочерние элементы в тему, загруженную по UUID
 * @param props - Пропсы компонента
 * @returns {JSX.Element} - Возвращает react-элемент, обернутый в тему
 */
export default function ThemeWrapperUuid({
    uuid,
    children,
    isUpperScope,
    noBackground88221033455786,
}: IThemeWrapperUuidProps) {
    const themeStorage = getThemeStorage();
    const theme = themeStorage.getThemeByUuid(uuid);
    const [activeTheme, setActiveTheme] = useState<IActiveTheme | undefined>();
    useEffect(() => {
        logger.warn('Используется загрузка темы по uuid! ThemeUUID!');
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

/**
 * Утилита для проверки, является ли переданный объект UUID
 * @param theme - Объект для проверки
 * @returns {boolean} - Возвращает true, если объект является UUID
 */
export function isUuid(theme: IActiveTheme | TUuid | undefined): theme is TUuid {
    return typeof theme === 'string';
}
