/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useMemo, forwardRef } from 'react';
import { Model } from 'Types/entity';
import { default as Background } from './Background';
import createThemeScope from 'UI/_theme/context';
import { THEME_APPLICATIONS } from 'UICommon/theme/controller';
import type { ReactNode, Ref, CSSProperties } from 'react';
import type { IBackground } from 'ExtControls/richColorPicker';
import type { TFontProp } from './StyleCreator';
import type { IActiveTheme } from 'UICommon/theme/controller';

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
    children?: ReactNode;
    font?: TFontProp;
    colorSchemes?: IColorShemes;
    /**
     * Создавать ли свой контейнер для фона.
     * При true, компонент ожидает что в качестве children будет корневая нода.
     */
    useChildrenContainer: boolean;
}

export type TStyleObjectRaw = Record<string, Partial<CSSProperties> | undefined>;

/**
 * Компонент подключения темы контента в режиме редактирования
 */
const ThemeDesigner = forwardRef(function ThemeDesigner(props: IProps, ref: Ref<HTMLElement>) {
    const activeTheme = useMemo<IActiveTheme>(
        (): IActiveTheme => ({
            properties: Model.fromObject<IActiveTheme>({
                logo: props?.properties.logo,
                picture: props?.properties.picture,
                background: props?.background.backgroundColor,
                image: props?.background.image,
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

    if (!props.children) {
        return null;
    }

    return (
        <ThemeScope activeTheme={activeTheme} noBackground1193214061={true}>
            <Background {...props} ref={ref as Ref<HTMLDivElement>}>
                {props.children}
            </Background>
        </ThemeScope>
    );
});
ThemeDesigner.displayName = 'UI/Theme:ThemeDesigner';

export default ThemeDesigner;
