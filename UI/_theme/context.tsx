/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
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
    staticThemeName?: string;
    isUpperScope?: boolean;
    children: ReactChild;
    noBackground1193214061?: boolean;
    /**
     * в popup не внедрено отображение фона
     *  https://online.sbis.ru/opendoc.html?guid=db38d223-4ea4-4f25-bcf8-e8d8658f7a54&client=3
     * @private
    */
    noBackground88221033455786?: boolean;
}

/**
 * Область активной темы. Подгружает css c sitetype и версией при построении.
 */
function ThemeScope(props: IThemeProps & {updateVer: number}): JSX.Element {
    const contextValue = useContext(ThemeContext);
    
    const [firstPalleteTheme, fullClassList] = useScopeTheme(props.activeTheme);

    const value: IThemeContext = useMemo(
        () => {
            if (!firstPalleteTheme) {
                return contextValue;
            }
            return {
                properties: firstPalleteTheme?.properties,
                theme: firstPalleteTheme?.selector,
                cacheId: firstPalleteTheme?.version,
                update: DEFAULT.update,
            };
        },
        [firstPalleteTheme]
    );
    
    if (props.staticThemeName && !fullClassList.includes('controls_theme-' + props.staticThemeName)) {
        fullClassList.unshift('controls_theme-' + props.staticThemeName)
    }

    const classList: string[] = useThemeClassName(
        fullClassList,
        props.isUpperScope ?? false
    );

    let hasThemeBackground: boolean = false;
    if (!!firstPalleteTheme) {
        hasThemeBackground =
            firstPalleteTheme.properties?.has('background') ||
            firstPalleteTheme.properties?.has('image') ||
            false;
    }

    if (firstPalleteTheme && hasThemeBackground && !props.noBackground1193214061) {
        return (
            <ThemeContext.Provider value={value}>
                <ThemeBackground
                    properties={firstPalleteTheme.properties}
                    classList={classList}
                    isUpperScope={props.isUpperScope ?? false}
                    noBackground88221033455786={props.noBackground88221033455786}
                >
                    {props.children as unknown as JSX.Element}
                </ThemeBackground>
            </ThemeContext.Provider>
        );
        
    }
    
    /* в случаях:
        - не передана активная тема
        - передана только шрифтовая палитра
        - не передан фон
    */
    let classes: string[] = isReactElement(props.children)
        ? [props.children.props.className]
        : [];
    
    // Добавление controls_themes__wrapper - костыль из-за близкого выпуска.
    // Кто-то другой должен отвечать за то, чтобы повесить стиль {color: var(--text-color)} на темизированный фрейм.
    // Но так брендбук работал раньше, поэтому костыль на нашей стороне.
    if (classList.length > 0) {
        classes = classes.concat(classList)
    }

    /* если нависил хоть какие то стили, 
     то добавим базовый стиль для шрифта, 
     так как могли в этих стилях добавить значение переменной текста */
    if (classList.length > 0 && !classes?.includes('controls_themes__wrapper')) {
        classes.push('controls_themes__wrapper');
    }

    const children = isReactElement(props.children)
        ? cloneElement(props.children, {className: classes.join(' ')})
        : (props.children as unknown as JSX.Element);
    
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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
                staticThemeName={props.staticThemeName}
                activeTheme={props.activeTheme}
                isUpperScope={props.isUpperScope}
                noBackground1193214061={props.noBackground1193214061}
                noBackground88221033455786={props.noBackground88221033455786}
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
