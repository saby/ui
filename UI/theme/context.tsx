import {
    createContext,
    useContext,
    useMemo,
    useState,
    cloneElement,
    useRef,
    useEffect,
} from 'react';
import type { Context, ReactChild, ReactElement, MutableRefObject } from 'react';
import { Body as BodyAPI, Head as HeadAPI, IPageTagId } from 'Application/Page';
import { logger } from 'Application/Env';
import { factory } from 'Types/chain';
import { getThemeController } from 'UICommon/ThemeInitializer';
import { IActiveTheme, TClassList, TThemePropertiesObject } from 'UICommon/theme/controller';
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

export function useThemeClassName(
    classList: TClassList | undefined,
    childrenClassName?: string
): string {
    const themeContext = useContext(ThemeContext);
    const isUpperScope = themeContext === DEFAULT;

    const bodyClassListRef = useRef<TClassList>([]);
    if (isUpperScope) {
        updateClassList(bodyClassListRef, classList);
    }
    const themeClassName: string = useMemo(() => {
        if (isUpperScope || !classList?.length) {
            return '';
        }
        let currentClassName = classList.join(' ');
        if (childrenClassName) {
            currentClassName = childrenClassName + ' ' + currentClassName;
        }
        return currentClassName;
    }, [classList, childrenClassName, isUpperScope]);
    return themeClassName;
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
function useActiveTheme(initialActiveTheme?: IActiveTheme): IActiveTheme | undefined {
    // const [activeTheme, setActiveTheme] = useState<IActiveTheme | undefined>(initialActiveTheme);
    const activeTheme = initialActiveTheme;
    const isFirstRender = useFirstRender();
    const isFirstRenderWithActiveTheme = isFirstRender && !!activeTheme;
    if (isFirstRenderWithActiveTheme) {
        getThemeController().applyStyles(activeTheme);
    }

    return activeTheme;
}

interface IThemeProps {
    /**
     * Тип сайта
     */
    activeTheme?: IActiveTheme;
    children: ReactChild;
}

/**
 * Область активной темы. Подгружает css c sitetype и версией при построении.
 */
function ThemeScope(props: IThemeProps & { updateVer: number }): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const activeTheme = useActiveTheme(props.activeTheme);

    const isUpperScope = themeContext === DEFAULT;

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
        [activeTheme, themeContext]
    );

    const childrenClassName = isReactElement(props.children)
        ? props.children.props.className
        : false;

    let className = useThemeClassName(activeTheme?.classList, childrenClassName);
    // Добавление controls_themes__wrapper - костыль из-за близкого выпуска.
    // Кто-то другой должен отвечать за то, чтобы повесить стиль {color: var(--text-color)} на темизированный фрейм.
    // Но так брендбук работал раньше, поэтому костыль на нашей стороне.
    if (!isUpperScope && className) {
        className += ' controls_themes__wrapper';
    }

    const children =
        className && isReactElement(props.children)
            ? cloneElement(props.children, { className })
            : props.children;
    if (!activeTheme) {
        if (!isUpperScope) {
            return children as JSX.Element;
        }
        return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
    }

    return (
        <ThemeContext.Provider value={value}>
            {activeTheme.properties?.has('background') ? (
                <ThemeVariablesCompat activeTheme={activeTheme}>{children}</ThemeVariablesCompat>
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
            <ThemeScope updateVer={updateVer} activeTheme={props.activeTheme}>
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

// В рантайме фрейма может быть несколько ThemeScope для одного themeId.
// Может быть так, что при отрисовке сначала маунтится 3, а потом анмаунтится первый из них.
// В итоге в useEffect удаляется style, хотя ещё два "владельца" живые.
// Так что будем удалять, когда все, позвавшие create, позовут delete.
class HeadStyleHelper {
    private isClientSide: boolean;
    private styleIdCounter: Map<IPageTagId, number> = new Map();
    constructor() {
        this.isClientSide = typeof document !== undefined;
    }
    createStyle(styleStr: string): IPageTagId {
        const styleId = HeadAPI.getInstance().createTag('style', {}, styleStr);
        if (this.isClientSide) {
            const nextCounter = (this.styleIdCounter.get(styleId) || 0) + 1;
            this.styleIdCounter.set(styleId, nextCounter);
        }
        return styleId;
    }
    deleteStyle(styleId: IPageTagId): void {
        if (!this.isClientSide) {
            return;
        }
        const nextCounter = (this.styleIdCounter.get(styleId) || 0) - 1;
        if (nextCounter < 0) {
            logger.error(
                'UI/theme/context:HeadStyleHelper Попытка удалить больше стилей, чем было добавлено'
            );
            return;
        }
        if (nextCounter === 0) {
            this.styleIdCounter.delete(styleId);
            HeadAPI.getInstance().deleteTag(styleId);
            return;
        }
        this.styleIdCounter.set(styleId, nextCounter);
    }
}

const headStyleHelper = new HeadStyleHelper();

// TODO перенести эти значения в css темы, а прослойку удалить.
// Видимо, нужно перенести преобразования в сохранение дизайн-тайм конструктора,
// после чего таким же алгоритмом конвертировать темы и удалить поля из properties.
function ThemeVariablesCompat(props: IThemeProps) {
    const themePropertiesRecord = props.activeTheme?.properties;
    const classList = props.activeTheme?.classList;
    const headStyleId = useRef<IPageTagId | undefined>();
    useMemo(() => {
        if (headStyleId.current) {
            headStyleHelper.deleteStyle(headStyleId.current);
        }
        if (!themePropertiesRecord || !classList?.length) {
            headStyleId.current = undefined;
            return;
        }
        const themeProperties: TThemePropertiesObject = factory(themePropertiesRecord).toObject();
        const styleStr = `.${classList.join('.')}{${calculateVaribalesFromThemeProperties(
            themeProperties
        )}}`;
        headStyleId.current = headStyleHelper.createStyle(styleStr);
    }, [themePropertiesRecord, classList]);

    useEffect(() => {
        return () => {
            if (headStyleId.current) {
                headStyleHelper.deleteStyle(headStyleId.current);
            }
        };
    }, []);

    return props.children as ReactElement;
}

function calculateVaribalesFromThemeProperties(themeProperties: TThemePropertiesObject): string {
    const { background, url_full: urlFull, logo, picture, texture } = { ...themeProperties };

    // Используем абсолютные пути, если они есть:
    const pictureUrl =
        picture?.url && urlFull?.picture?.includes(picture?.url) ? urlFull.picture : picture?.url;
    const logoUrl = logo?.url && urlFull?.logo?.includes(logo?.url) ? urlFull.logo : logo?.url;
    const textureUrl = texture && urlFull?.texture?.includes(texture) ? urlFull.texture : texture;
    const isGradient =
        !!background &&
        (background.indexOf('linear') !== -1 || background.indexOf('radial') !== -1);

    let result = '';

    if (background) {
        result += `--brandbook_background-color:${background};`;
        const unaccentedBackground = isGradient ? getFirstColor(background) : background;
        if (unaccentedBackground) {
            result += `--unaccented_background-color:${unaccentedBackground};`;
        }
    }

    const bgImgTexturePart = textureUrl ? `url("${textureUrl}")` : '';
    const bgImgGradientPart = isGradient ? background : '';
    const bgImgSeparatorPart = bgImgTexturePart.length && bgImgGradientPart.length ? ', ' : '';
    const backGroundImage = `${bgImgTexturePart}${bgImgSeparatorPart}${bgImgGradientPart}`;
    if (backGroundImage) {
        result += `--brandbook_background-image:${backGroundImage};`;
    }

    if (pictureUrl) {
        result += `--brandbook_picture-url:url("${addPreviewerToUrl(pictureUrl)}");`;
    }

    if (logoUrl) {
        result += `--brandbook_logo-url:url("${addPreviewerToUrl(logoUrl, true)}");`;
    }

    return result;
}

// https://git.sbis.ru/sbis/engine/-/blob/rc-24.3100/client/ExtControls/_brandbook/Wrapper.ts?ref_type=heads#L193
function addPreviewerToUrl(url: string, isLogo?: boolean): string {
    if (!url?.length) {
        return '';
    }

    // Хост в ссылке
    const hostRegexp = /^(https?:\/\/[^\/]+\/)/;

    // Наличие previewer в ссылке
    const hasPreviewerRegexp = /^(https?:\/\/[^\/]+)?\/previewer\//;

    // Наличие cdn в ссылке
    const urlContainsCdn = /^(https?:\/\/[^\/]+)?\/cdn\//;

    // Если ссылка уже содержит previewer или cdn, возвращаем без изменений
    if (hasPreviewerRegexp.test(url) || urlContainsCdn.test(url)) {
        return url;
    }

    // Добавляем previewer в начало относительной ссылки
    // если это логотип, то устанавливаем размеры картинки по ширине и высоте в 100px
    // чтобы изначально большая картинка не выглядела плохо в логотипе
    if (!url.match(hostRegexp)) {
        return isLogo ? '/previewer/r/100/100/' + url : '/previewer' + url;
    }

    // Добавляем previewer после доменного имени в url
    return url.replace(hostRegexp, isLogo ? '$1previewer/r/100/100/' : '$1previewer/');
}

const gradientFirstColorRegExp = /(#\w+)|((rgb|rgba|hsl|hsla|var)\([^)]+\))/;
function getFirstColor(background: string): string | undefined {
    return background.match(gradientFirstColorRegExp)?.[0];
}
