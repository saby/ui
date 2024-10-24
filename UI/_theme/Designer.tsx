/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useMemo, forwardRef } from 'react';
import type { ReactNode, LegacyRef, Ref, CSSProperties } from 'react';
import {
    Wrapper as ControlsThemesWrapper,
    Provider as ControlsThemesProvider,
} from 'Controls/themes';
import type { IBackground } from 'ExtControls/richColorPicker';
import { Model } from 'Types/entity';
import { default as BackgroundViewer, DARK_CLASS, LIGHT_CLASS } from './BackgroundViewer';
import { calculateVaribalesFromThemeProperties } from './background/cssVariables';
import { default as StyleCreator, TFontProp } from './StyleCreator';
import createThemeScope from 'UI/_theme/context';
import type { IActiveTheme } from 'UICommon/theme/controller';
import { THEME_APPLICATIONS } from 'UICommon/theme/controller';

const ThemeScope = createThemeScope();

interface IColorShemes {
    light?: CSSProperties;
    dark?: CSSProperties;
}
interface IProps {
    // FIXME пересмтроеть в ExtControls и сделать такой же как в activeTheme
    background: IBackground;
    className?: string;
    properties: Record<string, string | undefined>;
    variables: Record<string, string>;
    children?: ReactNode;
    font?: TFontProp;
    colorSchemes?: IColorShemes;
    /**
     * Создавать ли свой контейнер для фона.
     * При true, компонент ожидает что в качестве children будет корневая нода.
     */
    useChildrenContainer: boolean;
}

/**
 * @link https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
function hashCode(str: string) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
        hash = (hash << 5) - hash + chr;
        // eslint-disable-next-line no-bitwise
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function generateUniqTheme(styleObj: object): string {
    try {
        const styleStr = JSON.stringify(styleObj);
        return 't-' + hashCode(styleStr);
    } catch (e) {
        return 't-wrang-style';
    }
}

export type TStyleObjectRaw = Record<string, Partial<CSSProperties> | undefined>;

/**
 * Создание объекта стилей для ReactDomElement
 */
function createReactStyleObject(
    styleObjectRaw: TStyleObjectRaw,
    guidDesignTheme: string,
    colorSchemes?: IColorShemes,
    font?: TFontProp
) {
    // Если не прилетают цветовые схемы, то className пустая строка. По умолчанию стили t-dark t-light
    const guidLight = colorSchemes?.light ? guidDesignTheme + '_' + LIGHT_CLASS : '';
    const guidDark = colorSchemes?.dark ? guidDesignTheme + '_' + DARK_CLASS : '';
    const stylesObject: Record<string, Partial<CSSProperties> | undefined> = {
        ['.' + guidDesignTheme]: styleObjectRaw.background,
        ['.' + guidLight]: styleObjectRaw.light,
        ['.' + guidDark]: styleObjectRaw.dark,
        ...font,
    };
    return { stylesObject, guidLight, guidDark };
}

const LEGACY_LOGO_URL = '--brandbook_logo-url';
const LEGACY_PICTURE_URL = '--brandbook_picture-url';
/**
 * Компонент подключения темы контента в режиме редактирования
 */
const ThemeDesigner = forwardRef(function ThemeDesigner(props: IProps, ref: LegacyRef<unknown>) {
    const valueControlsThemes = useMemo(
        () => ({
            logo: props?.properties.logo,
            picture: props?.properties.picture,
            variables: {
                [LEGACY_LOGO_URL]: props?.properties.logo,
                [LEGACY_PICTURE_URL]: props?.properties.picture,
            },
        }),
        [props?.properties.logo, props?.properties.picture]
    );

    const activeTheme = useMemo<IActiveTheme>(
        (): IActiveTheme => ({
            properties: Model.fromObject<IActiveTheme>({
                logo: props?.properties.logo,
                picture: props?.properties.picture,
                background: props?.background.backgroundColor,
                // FIXME првоерить что не используется и удалить
                backgroundColor: props?.background.backgroundColor,
                dominantColorRGB: props?.background.dominantColorRGB,
                texture: props?.background.texture,
            }),
            themeApply: THEME_APPLICATIONS.palette,
            version: Math.random(),
        }),
        [props?.properties, props?.background]
    );

    const backViewerProps = {
        texture: props?.background.texture,
        background: props?.background.backgroundColor,
        dominantColorRGB: props?.background.dominantColorRGB,
    };

    const styleObjectRaw: TStyleObjectRaw = useMemo(
        () => {
            const cssBackgroundVars = calculateVaribalesFromThemeProperties({
                logo: undefined,
                picture: undefined,
                texture: backViewerProps.texture,
                background: backViewerProps.background,
                dominantColorRGB: backViewerProps.dominantColorRGB,
                url_full: {
                    logo: valueControlsThemes.logo,
                    picture: valueControlsThemes.picture,
                    texture: backViewerProps.texture,
                },
            });
            return {
                ['background']: cssBackgroundVars,
                ['light']: props.colorSchemes?.light ?? undefined,
                ['dark']: props.colorSchemes?.dark ?? undefined,
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.colorSchemes, valueControlsThemes, props?.background]
    );

    // Создаём уникальное имя, что бы перебить стиль темы сверху (body)
    const guidDesignTheme = useMemo(() => {
        return generateUniqTheme(styleObjectRaw);
    }, [styleObjectRaw]);

    if (!props.children) {
        return null;
    }

    const backgroundClassNames = [];
    if (styleObjectRaw.background || styleObjectRaw.light || styleObjectRaw.dark) {
        backgroundClassNames.push('controls_theme-default');
    }

    if (styleObjectRaw.background) {
        backgroundClassNames.push(guidDesignTheme);
    }

    const { stylesObject, guidLight, guidDark } = createReactStyleObject(
        styleObjectRaw,
        guidDesignTheme,
        props.colorSchemes,
        props.font
    );

    const Styles =
        Object.keys(stylesObject).length > 0 ? <StyleCreator styles={stylesObject} /> : null;
    return (
        <>
            {Styles}
            <ThemeScope activeTheme={activeTheme} noBackground1193214061={true}>
                <ControlsThemesWrapper
                    variables={props.variables}
                    className={props.className}
                    ref={ref as Ref<unknown>}
                >
                    <ControlsThemesProvider value={valueControlsThemes}>
                        <BackgroundViewer
                            background={backViewerProps}
                            backgroundClassName={
                                backgroundClassNames.length > 0
                                    ? backgroundClassNames.join(' ')
                                    : undefined
                            }
                            schemeStyleLight={guidLight}
                            schemeStyleDark={guidDark}
                            useChildrenContainer={props.useChildrenContainer}
                        >
                            {props.children}
                        </BackgroundViewer>
                    </ControlsThemesProvider>
                </ControlsThemesWrapper>
            </ThemeScope>
        </>
    );
});
ThemeDesigner.displayName = 'UI/Theme:ThemeDesigner';

export default ThemeDesigner;
