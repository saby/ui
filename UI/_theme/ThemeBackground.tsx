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
    const staticThemeName = themeProperties?.staticTheme || 'default';

    const classList = props.activeTheme.classList;
    const stylesSelector = useMemo(() => {
        if (classList?.length) {
            return '.' + classList.join('.');
        }
    }, [classList]);
    const StyleCreatorTag = useMemo(() => {
        if (!stylesSelector) {
            return null;
        }

        const styleObject = {
            [stylesSelector]: calculateVaribalesFromThemeProperties(themeProperties),
        };
        return <StyleCreator styles={styleObject} />;
    }, [themeProperties, stylesSelector]);

    // Быстрый костыль. Нужно иначе темизировать заглушки в Hint, но это долго.
    // Обсуждение в ленте ошибки https://online.sbis.ru/opendoc.html?guid=ac345054-f82f-4390-8854-28979d117c3d&client=3
    const hintStyleTag = useMemo(() => {
        if (!stylesSelector) {
            return null;
        }

        // Не могу использовать StyleCreator: он вызывает toLowerCase, а тут нужна большая "H".
        const styleValue =
            '--text-color_Hint-Template:var(--unaccented_text-color);' +
            '--path-color_Hint-Template:var(--unaccented_text-color);';
        return (
            // Без добавления .controls_Hint_theme-default не хватает веса селектора.
            <style>{`${stylesSelector} .controls_Hint_theme-${staticThemeName} { ${styleValue} }`}</style>
        );
    }, [staticThemeName, stylesSelector]);

    return (
        <>
            {StyleCreatorTag}
            {hintStyleTag}
            <BackgroundViewer
                background={themeProperties}
                backgroundClassName={`controls_theme-${staticThemeName} tw-h-full`}
                useChildrenContainer={true}
                isUpperScope={props.isUpperScope}
            >
                {props.children}
            </BackgroundViewer>
        </>
    );
}
