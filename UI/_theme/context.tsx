import { createContext, useContext, useMemo, useState, cloneElement } from 'react';
import type { Context, ReactChild } from 'react';

import ThemeBackground from './ThemeBackground';
import { useThemeClassName } from './useThemeClassName';
import { getThemeController } from 'UICommon/ThemeInitializer';
import { IActiveTheme, TClassList, THEME_APPLICATIONS } from 'UICommon/theme/controller';
import { isReactElement } from 'UICore/Executor';

interface IThemeContext {
    theme?: string;
    cacheId?: number;
    classList?: TClassList;
    properties?: IActiveTheme['properties'];
    update: () => void;
}

const DEFAULT: IThemeContext = {
    update: () => undefined,
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
export const ThemeContext: Context<IThemeContext> = createContext(DEFAULT);

export function useIsUpperScope() {
    const themeContext = useContext(ThemeContext);
    const isUpperScope = themeContext === DEFAULT;
    return isUpperScope;
}

/**
 * Хук для вставки css темы.
 * @param activeTheme
 * @returns activeTheme
 * @private
 */
function useActiveTheme(
    activeTheme?: IActiveTheme | IActiveTheme[]
): [IActiveTheme | undefined, TClassList] {
    // Так должно быть быстрее, чем на каждый чих пересчитывать classList и вставлять css.
    const activeThemeHash = useMemo(() => {
        if (!activeTheme) {
            return '';
        }
        if (!Array.isArray(activeTheme)) {
            return `${activeTheme.selector}:${activeTheme.version}`;
        }
        return activeTheme.map((theme) => `${theme?.selector}:${theme?.version}`).join(',');
    }, [activeTheme]);

    const result: [IActiveTheme | undefined, TClassList] = useMemo(() => {
        const themeArr: (IActiveTheme | undefined)[] = Array.isArray(activeTheme)
            ? activeTheme
            : [activeTheme];
        const themeController = getThemeController();
        let firstPalleteTheme: IActiveTheme | undefined;
        const fullClassList: TClassList = [];
        for (const theme of themeArr) {
            if (!theme) {
                continue;
            }
            if (!firstPalleteTheme && theme.themeApply === THEME_APPLICATIONS.palette) {
                firstPalleteTheme = theme;
            }
            themeController.applyStyles(theme);
            if (theme.classList?.length) {
                for (const className of theme.classList) {
                    fullClassList.push(className);
                }
            }
        }

        return [firstPalleteTheme, fullClassList];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeThemeHash]);

    return result;
}

interface IThemeProps {
    /**
     * Тип сайта
     */
    activeTheme?: IActiveTheme | IActiveTheme[];
    isUpperScope?: boolean;
    children: ReactChild;
    noBackground1193214061?: boolean;
}

/**
 * Область активной темы. Подгружает css c sitetype и версией при построении.
 */
function ThemeScope(props: IThemeProps & { updateVer: number }): JSX.Element {
    const [firstPalleteTheme, fullClassList] = useActiveTheme(props.activeTheme);

    const value: IThemeContext = useMemo(
        () => ({
            properties: firstPalleteTheme?.properties,
            theme: firstPalleteTheme?.selector,
            cacheId: firstPalleteTheme?.version,
            update: DEFAULT.update,
        }),
        [firstPalleteTheme]
    );

    const childrenClassName: string | undefined = isReactElement(props.children)
        ? props.children.props.className
        : undefined;

    const className = useThemeClassName(
        fullClassList,
        props.isUpperScope ?? false,
        childrenClassName
    );
    // Добавление controls_themes__wrapper - костыль из-за близкого выпуска.
    // Кто-то другой должен отвечать за то, чтобы повесить стиль {color: var(--text-color)} на темизированный фрейм.
    // Но так брендбук работал раньше, поэтому костыль на нашей стороне.
    const classes = [];
    if (className) {
        classes.push(className);
    }
    if (!className?.includes('controls_themes__wrapper')) {
        classes.push('controls_themes__wrapper');
    }

    const children = isReactElement(props.children)
        ? cloneElement(props.children, { className: classes.join(' ') })
        : (props.children as unknown as JSX.Element);
    if (!firstPalleteTheme) {
        if (!props.isUpperScope) {
            return children;
        }
        return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
    }

    return (
        <ThemeContext.Provider value={value}>
            {firstPalleteTheme.properties?.has('background') && !props.noBackground1193214061 ? (
                <ThemeBackground
                    activeTheme={firstPalleteTheme}
                    isUpperScope={props.isUpperScope ?? false}
                >
                    {children}
                </ThemeBackground>
            ) : (
                children
            )}
        </ThemeContext.Provider>
    );
}

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
    let setUpdateScope: (number: number) => void;
    const Scope = function (props: IThemeProps) {
        const [updateVer, setUpdateVer] = useState(0);
        setUpdateScope = setUpdateVer;

        return (
            <ThemeScope
                updateVer={updateVer}
                activeTheme={props.activeTheme}
                isUpperScope={props.isUpperScope}
                noBackground1193214061={props.noBackground1193214061}
            >
                {props.children}
            </ThemeScope>
        );
    };
    Scope.reload = () => {
        setUpdateScope(Math.random());
    };
    Scope.displayName = 'UI/Theme:Context.Scope';
    return Scope;
}
