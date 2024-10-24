import { createContext, useContext, useMemo, useState, cloneElement } from 'react';
import type { Context, ReactChild } from 'react';

import ThemeBackground from './ThemeBackground';
import { useThemeClassName } from './useThemeClassName';
import { useScopeTheme } from './useScopeTheme';
import { IActiveTheme, TClassList } from 'UICommon/theme/controller';
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
    const [firstPalleteTheme, fullClassList] = useScopeTheme(props.activeTheme);

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

    const hasThemeBackground =
        firstPalleteTheme.properties?.has('background') ||
        firstPalleteTheme.properties?.has('image');

    return (
        <ThemeContext.Provider value={value}>
            {hasThemeBackground && !props.noBackground1193214061 ? (
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
