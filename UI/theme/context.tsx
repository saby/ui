import { createContext, useContext, useMemo, useState, cloneElement, useEffect } from 'react';
import type { Context } from 'react';
import { getThemeController } from 'UICommon/ThemeInitializer';
import { TScopeType, TSiteType } from 'UICommon/theme/controller';

const DEFAULT = {
    sitetype: 'default',
    update: (sitetype: string) => undefined,
};

/**
 * Контекст темы в области.
 * Может перезагрузить активную тему в области вызовом функции update(sitetype)
 * @example
 * function MyComponent(props) {
 *      const { update } = useContext(ThemeContext);
 *      const updateTheme = () => update();
 *      return <button click={updateTheme}>Обновить тему</button>;
 *  }
 *
 */
export const ThemeContext: Context<typeof DEFAULT> = createContext(DEFAULT);

interface IThemeProps {
    /**
     * Тип сайта
     */
    sitetype?: TSiteType;
    scopetype?: TScopeType;
    children: JSX.Element;
}

/**
 * Область активной темы. Подгружает css c sitetype и версией при построении.
 */
function ThemeScope(props: IThemeProps & { updateVer: number }): JSX.Element {
    const { sitetype: currentSitetype } = useContext(ThemeContext);
    const sitetype: TSiteType = props.sitetype || currentSitetype;
    const scopetype: TScopeType = props.scopetype || 'USER';
    const value: typeof DEFAULT = useMemo(
        () => ({
            sitetype,
            update: () => {
                getThemeController().getVariablesFeature(sitetype, scopetype);
            },
        }),
        [sitetype, scopetype]
    );

    useEffect(() => {
        getThemeController().getVariablesFeature(sitetype, scopetype);
    }, [sitetype, scopetype]);

    if (!props.sitetype) {
        return props.children;
    }

    return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}

/**
 * Временный стиль для установки темы
 */
const TEMP_THEME_STYLE = 'brand';

/**
 * Создает область темы
 * @method reload обновляет тему текущей области
 * @returns ThemeScope
 * @example
 *  import createThemeScope from 'UI/theme/context';
 *  const ThemeScope = createThemeScope();
 *  function ThemeWrapper(props) {
 *      return <ThemeScope>{ props.children }</ThemeScope>;
 *  }
 */
export default function createThemeScope() {
    let setUpdateScope: (number) => void;
    const Scope = function (props: IThemeProps) {
        const [updateVer, setUpdateVer] = useState(0);
        setUpdateScope = setUpdateVer;

        let className = TEMP_THEME_STYLE;
        if (props.children?.props?.className) {
            className = props.children?.props?.className + ' ' + className;
        }
        return (
            <ThemeScope sitetype={props.sitetype} scopetype={props.scopetype} updateVer={updateVer}>
                {cloneElement(props.children, { className })}
            </ThemeScope>
        );
    };
    Scope.reload = () => {
        setUpdateScope(Math.random());
    };
    return Scope;
}
