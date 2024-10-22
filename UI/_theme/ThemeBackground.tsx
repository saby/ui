import { useMemo } from 'react';
import { IActiveTheme, TThemePropertiesObject } from 'UICommon/theme/controller';
import BackgroundViewer from './BackgroundViewer';
import { default as StyleCreator } from './StyleCreator';
import { calculateVaribalesFromThemeProperties } from 'UI/_theme/background/cssVariables';
import { factory } from 'Types/chain';

interface IThemeVariablesCompatProps {
    activeTheme: IActiveTheme;
    children: JSX.Element;
    isUpperScope: boolean;
}

export default function ThemeBackground(props: IThemeVariablesCompatProps): JSX.Element {
    const themePropertiesRecord = props.activeTheme.properties;
    const themeProperties: TThemePropertiesObject = useMemo(
        () => (themePropertiesRecord ? factory(themePropertiesRecord).toObject() : {}),
        [themePropertiesRecord]
    );

    const classList = props.activeTheme.classList;
    const StyleCreatorTag = useMemo(() => {
        if (!classList || classList?.length === 0) {
            return null;
        }

        const styleObject = {
            ['.' + classList.join('.')]: calculateVaribalesFromThemeProperties(themeProperties),
        };
        return <StyleCreator styles={styleObject} />;
    }, [themeProperties, classList]);

    return (
        <>
            {StyleCreatorTag}
            <BackgroundViewer
                background={themeProperties}
                backgroundClassName="controls_theme-default tw-h-full"
                useChildrenContainer={true}
                isUpperScope={props.isUpperScope}
            >
                {props.children}
            </BackgroundViewer>
        </>
    );
}
