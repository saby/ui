/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useMemo, forwardRef } from 'react';
import type { ReactNode, Ref, CSSProperties } from 'react';
import type { IBackground } from './background/IBackground';
import { default as BackgroundViewer, DARK_CLASS, LIGHT_CLASS } from './BackgroundViewer';
import { default as generateUniqueID } from './ThemeIDGenerator';
import { calculateVaribalesFromThemeProperties } from './background/cssVariables';
import { default as StyleCreator, TFontProp } from './StyleCreator';

interface IColorShemes {
    light?: CSSProperties;
    dark?: CSSProperties;
}
interface IProps {
    // FIXME пересмтроеть в ExtControls и сделать такой же как в activeTheme
    background: IBackground;
    className?: string;
    properties: Record<string, string | undefined>;
    children?: ReactNode;
    font?: TFontProp;
    colorSchemes?: IColorShemes;
    /**
     * Создавать ли свой контейнер для фона.
     * При true, компонент ожидает что в качестве children будет корневая нода.
     */
    useChildrenContainer: boolean;
    /**
     * в popup не внедрено отображение фона
     *  https://online.sbis.ru/opendoc.html?guid=db38d223-4ea4-4f25-bcf8-e8d8658f7a54&client=3
     * @private
     */
    noBackground88221033455786?: boolean;
    selector?: string;
}

// Для селектора, равному по силе рантайму.
const BACKGROUND_CLASS_NAME = 'ui_theme-background';

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
    const guidLight = colorSchemes?.light ? LIGHT_CLASS : '';
    const guidDark = colorSchemes?.dark ? DARK_CLASS : '';
    const stylesObject: Record<string, Partial<CSSProperties> | undefined> = {
        ['.' + guidDesignTheme]: styleObjectRaw.background,
        [`.${guidDesignTheme}.${LIGHT_CLASS}.${BACKGROUND_CLASS_NAME}, .${guidDesignTheme}.${BACKGROUND_CLASS_NAME} .${LIGHT_CLASS}`]:
            styleObjectRaw.light,
        [`.${guidDesignTheme}.${DARK_CLASS}.${BACKGROUND_CLASS_NAME}, .${guidDesignTheme}.${BACKGROUND_CLASS_NAME} .${DARK_CLASS}`]:
            styleObjectRaw.dark,
        ...font,
    };
    return { stylesObject, guidLight, guidDark };
}

/**
 * Контрол отображения фона
 */
const Background = forwardRef(function Background(props: IProps, ref: Ref<HTMLElement>) {
    const backViewerProps = {
        texture: props?.background.texture,
        background: props?.background.backgroundColor,
        dominantColorRGB: props?.background.dominantColorRGB,
        image: props?.background.image,
    };

    const styleObjectRaw: TStyleObjectRaw = useMemo(
        () => {
            const cssBackgroundVars = calculateVaribalesFromThemeProperties({
                logo: undefined,
                picture: undefined,
                texture: backViewerProps.texture,
                background: backViewerProps.background,
                image: backViewerProps.image,
                dominantColorRGB: backViewerProps.dominantColorRGB,
                url_full: {
                    logo: props?.properties.logo,
                    picture: props?.properties.picture,
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
        [props.colorSchemes, props?.properties, props?.background]
    );

    // Создаём уникальное имя, что бы перебить стиль темы сверху (body)
    const guidDesignTheme = useMemo(() => {
        return props.selector ?? generateUniqueID(styleObjectRaw);
    }, [styleObjectRaw, props.selector]);

    const { stylesObject, guidLight, guidDark } = useMemo(
        () =>
            createReactStyleObject(styleObjectRaw, guidDesignTheme, props.colorSchemes, props.font),
        [styleObjectRaw, guidDesignTheme, props.colorSchemes, props.font]
    );

    if (!props.children) {
        return null;
    }

    const backgroundClassNames = [];
    if (styleObjectRaw.background || styleObjectRaw.light || styleObjectRaw.dark) {
        /** всегда ли использовать default?
         или можно получать сататичную из properties как в ThemeBackground*/
        backgroundClassNames.push('controls_theme-default');
        backgroundClassNames.push(guidDesignTheme);
        backgroundClassNames.push(BACKGROUND_CLASS_NAME);
    }

    const Styles =
        Object.keys(stylesObject).length > 0 ? <StyleCreator styles={stylesObject} /> : null;
    return (
        <>
            {Styles}
            <BackgroundViewer
                className={props.className}
                background={backViewerProps}
                themeStyleSelector={
                    backgroundClassNames.length > 0 ? backgroundClassNames.join(' ') : undefined
                }
                schemeStyleLight={guidLight}
                schemeStyleDark={guidDark}
                useChildrenContainer={props.useChildrenContainer}
                noBackground88221033455786={props.noBackground88221033455786}
                ref={ref as Ref<HTMLDivElement>}
            >
                {props.children}
            </BackgroundViewer>
        </>
    );
});
Background.displayName = 'UI/Theme:Background';

export default Background;
