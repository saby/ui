import {
    createContext,
    useContext,
    useMemo,
    useState,
    cloneElement,
    useEffect,
    useRef,
} from 'react';
import type { Context, MutableRefObject } from 'react';
import { Body as BodyAPI } from 'Application/Page';
import { getThemeController } from 'UICommon/ThemeInitializer';
import { TScopeType, TSiteType, IActiveTheme, TClassList } from 'UICommon/theme/controller';

interface IThemeContext {
    sitetype: TSiteType;
    update: (sitetype: TSiteType) => void;
}

const DEFAULT: IThemeContext = {
    sitetype: 'default',
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

interface IThemeProps {
    /**
     * Тип сайта
     */
    sitetype?: TSiteType;
    scopetype?: TScopeType;
    activeTheme?: IActiveTheme;
    children: JSX.Element;
}

function updateClassList(
    classListRef: MutableRefObject<TClassList>,
    nextClassList: Promise<TClassList | void> | TClassList | void
): void {
    if (!nextClassList) {
        return;
    }
    if (Array.isArray(nextClassList)) {
        BodyAPI.getInstance().replaceClasses(classListRef.current, nextClassList);
        classListRef.current = nextClassList;
        return;
    }
    nextClassList.then((asyncNextClassList) => {
        updateClassList(classListRef, asyncNextClassList);
    });
}

/**
 * Хук для синхронного применения активной темы во время первого рендера.
 * @returns true, если это первый рендер и есть данные о активной теме.
 */
function useFirstRenderActiveTheme(
    classListRef: MutableRefObject<TClassList>,
    activeTheme?: IActiveTheme
): boolean {
    const firstRenderRef = useRef<boolean>(true);
    if (!firstRenderRef.current) {
        return false;
    }

    firstRenderRef.current = false;
    if (!activeTheme) {
        return false;
    }

    getThemeController().applyStyles(activeTheme);

    const initialClassList = activeTheme.classList;
    if (initialClassList?.length) {
        updateClassList(classListRef, initialClassList);
    }
    return true;
}

/**
 * Область активной темы. Подгружает css c sitetype и версией при построении.
 */
function ThemeScope(props: IThemeProps & { updateVer: number }): JSX.Element {
    const { sitetype: currentSitetype } = useContext(ThemeContext);
    const classListRef = useRef<TClassList>([]);
    const isFirstRenderWithActiveTheme = useFirstRenderActiveTheme(classListRef, props.activeTheme);
    const sitetype: TSiteType = props.sitetype || currentSitetype;
    const scopetype: TScopeType = props.scopetype || 'USER';
    const value: IThemeContext = useMemo(
        () => ({
            sitetype,
            update: () => {
                const variablesFeature = getThemeController().getVariablesFeature(
                    sitetype,
                    scopetype
                );
                updateClassList(classListRef, variablesFeature);
            },
        }),
        [sitetype, scopetype]
    );

    useEffect(() => {
        if (!isFirstRenderWithActiveTheme) {
            // Делаем запрос только когда нет данных с сервера или поменялось что-то из sitetype и scopetype.
            const variablesFeature = getThemeController().getVariablesFeature(sitetype, scopetype);
            updateClassList(classListRef, variablesFeature);
        }
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
            <ThemeScope
                sitetype={props.sitetype}
                scopetype={props.scopetype}
                updateVer={updateVer}
                activeTheme={props.activeTheme}
            >
                {cloneElement(props.children, { className })}
            </ThemeScope>
        );
    };
    Scope.reload = () => {
        setUpdateScope(Math.random());
    };
    return Scope;
}
