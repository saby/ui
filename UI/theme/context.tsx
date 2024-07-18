import { createContext, useContext, useMemo, useState, cloneElement, useRef } from 'react';
import type { Context, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { Body as BodyAPI } from 'Application/Page';
import { getThemeController } from 'UICommon/ThemeInitializer';
import { IActiveTheme, TClassList } from 'UICommon/theme/controller';

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

interface IThemeProps {
    /**
     * Тип сайта
     */
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
        classListRef.current = [...nextClassList];
        return;
    }
    nextClassList.then((asyncNextClassList) => {
        updateClassList(classListRef, asyncNextClassList);
    });
}

/**
 * Грузит активную тему.
 * Если загрузилась, добавляет стиль в HEAD и отстреливает колбеком.
 * @param sitetype
 * @param scopetype
 * @param callback
 * @private
 */
// TODO раскомментировать и переписать тут https://online.sbis.ru/opendoc.html?guid=02456a1e-6f17-4055-9e61-4de9ca7ad2cf&client=3
// async function loadActiveTheme(
//     sitetype: TSiteType,
//     scopetype: TScopeType,
//     callback: (activeTheme: IActiveTheme) => void
// ) {
//     const activeTheme = await getThemeController()
//         .getActiveTheme(sitetype, scopetype)
//         .catch(() => undefined);
//     if (activeTheme) {
//         getThemeController().applyStyles(activeTheme);
//         callback(activeTheme);
//     }
// }

// Возможно, этот хук можно куда-то положить и отдавать наружу. Будто бы может быть нужен не только нам.
function useFirstRender(): boolean {
    const firstRenderRef = useRef<boolean>(true);
    const isFirstRender = firstRenderRef.current;
    firstRenderRef.current = false;
    return isFirstRender;
}

/**
 * Хук для работы с активной темой.
 * При первом рендере пытается взять из пропсов, если нет - делает запрос.
 * Ещё запрос происходит при смене sitetype или scopetype
 * @param sitetype
 * @param scopetype
 * @param initialActiveTheme
 * @returns [activeTheme, setActiveTheme]
 * @private
 */
function useActiveTheme(
    initialActiveTheme?: IActiveTheme
): [IActiveTheme | undefined, Dispatch<SetStateAction<IActiveTheme>>] {
    const [activeTheme, setActiveTheme] = useState<IActiveTheme | undefined>(initialActiveTheme);
    const isFirstRender = useFirstRender();
    const isFirstRenderWithActiveTheme = isFirstRender && !!activeTheme;
    if (isFirstRenderWithActiveTheme) {
        getThemeController().applyStyles(activeTheme);
    }

    // TODO пока не важно, но есть потенциальная гонка.
    // Нужно будет учесть, что в теории sitetype или scopetype может поменяться два раза подряд,
    // а первый запрос - выполняться дольше.
    // TODO раскомментировать и переписать тут https://online.sbis.ru/opendoc.html?guid=02456a1e-6f17-4055-9e61-4de9ca7ad2cf&client=3
    // useEffect(() => {
    //     if (!isFirstRenderWithActiveTheme) {
    //         // Делаем запрос только когда нет данных с сервера или поменялось что-то из sitetype и scopetype.
    //         loadActiveTheme(sitetype, scopetype, setActiveTheme);
    //     }
    // }, [sitetype, scopetype]);

    return [activeTheme, setActiveTheme];
}

/**
 * Область активной темы. Подгружает css c sitetype и версией при построении.
 */
function ThemeScope(props: IThemeProps & { updateVer: number }): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const [activeTheme] = useActiveTheme(props.activeTheme);

    const isUpperScope = themeContext === DEFAULT;
    const bodyClassListRef = useRef<TClassList>([]);
    if (isUpperScope) {
        updateClassList(bodyClassListRef, activeTheme?.classList);
    }

    // TODO раскомментировать и переписать тут https://online.sbis.ru/opendoc.html?guid=02456a1e-6f17-4055-9e61-4de9ca7ad2cf&client=3
    // const update = useCallback(() => {
    //     // Может быть стоит заменить на вызов loadActiveTheme(sitetype, scopetype, setActiveTheme)?
    //     // Разница в том, что тогда компонент перерисуется и актуализирует данные в контексте.
    //     // Но пока логику не меняю.
    //     const variablesFeature = getThemeController().getVariablesFeature(sitetype, scopetype);
    //     updateClassList(classListRef, variablesFeature);
    // }, [sitetype, scopetype]);
    const value: IThemeContext = useMemo(
        () => ({
            properties: activeTheme?.properties,
            theme: activeTheme?.selector,
            cacheId: activeTheme?.version,
            update: themeContext.update,
        }),
        [activeTheme]
    );

    const className: string = useMemo(() => {
        if (isUpperScope || !activeTheme?.classList?.length) {
            return '';
        }
        let currentClassName = activeTheme.classList.join(' ');
        if (props.children.props.className) {
            currentClassName = props.children.props.className + ' ' + currentClassName;
        }
        return currentClassName;
    }, [activeTheme?.classList, props.children.props.className, isUpperScope]);

    const children = className ? cloneElement(props.children, { className }) : props.children;

    if (!activeTheme) {
        return children;
    }

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
            <ThemeScope updateVer={updateVer} activeTheme={props.activeTheme}>
                {props.children}
            </ThemeScope>
        );
    };
    Scope.reload = () => {
        setUpdateScope(Math.random());
    };
    return Scope;
}
