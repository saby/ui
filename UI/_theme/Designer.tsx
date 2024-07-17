/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
*/
import { useMemo, forwardRef } from 'react';
import type { ReactNode, LegacyRef, Ref } from 'react';
import {
    Wrapper as ControlsThemesWrapper,
    Provider as ControlsThemesProvider,
} from 'Controls/themes';
import type { IBackground } from 'ExtControls/richColorPicker';
import { Model } from 'Types/entity';
import { default as BackgroundViewer } from './BackgroundViewer';
import createThemeScope from 'UI/theme/context';
import type { IActiveTheme } from 'UI/theme/controller'


const ThemeScope = createThemeScope();

interface IProps {
    background: IBackground;
    className?: string;
    properties: Record<string, string | undefined>;
    variables: Record<string, string>;
    children?: ReactNode | undefined;
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
            }
        }),
        [props?.properties.logo, props?.properties.picture]
    );

    const activeTheme = useMemo<IActiveTheme>(
        (): IActiveTheme => ({
            properties: Model.fromObject<IActiveTheme>({
                logo: props?.properties.logo,
                picture: props?.properties.picture,
                backgroundColor: props?.background.backgroundColor,
                dominantColorRGB: props?.background.dominantColorRGB,
                texture: props?.background.texture,
            }),
        }),
        [props?.properties, props?.properties, props?.background]
    );

    if (!props.children) {
        return null;
    }

    const backViewerProps = {
        url: props?.background.texture,
        color: props?.background.backgroundColor,
    };

    return (
        <ThemeScope activeTheme={activeTheme}>
            <ControlsThemesWrapper
                variables={props.variables}
                className={props.className}
                ref={ref as Ref<unknown>}
            >
                <ControlsThemesProvider value={ valueControlsThemes }>
                    <BackgroundViewer background={ backViewerProps }>
                        {props.children}
                    </BackgroundViewer>
                </ControlsThemesProvider>
            </ControlsThemesWrapper>
        </ThemeScope>
    );
});
ThemeDesigner.displayName = 'UI/Theme:ThemeDesigner';

export default ThemeDesigner;
